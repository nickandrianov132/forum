import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, Observable } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { ApolloProvider } from '@apollo/client/react';
import MUForum from './MUForum.tsx';
import { logout, setCredentials } from './store/slices/authSlice.ts';
import { store } from './store/store.ts';
import { useAuthInit } from './hooks/useAuthInit.ts';

// 1. HTTP Link
const httpLink = new HttpLink({
  uri: 'http://localhost:7000/graphql',
});

// Глобальное состояние очереди для модуля (файла)
let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

const resolvePendingRequests = (token: string | null) => {
  pendingRequests.forEach((callback) => callback(token));
  pendingRequests = [];
};

// 2. Refresh Link (Полный контроль над сессией)
const refreshLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    let sub: any;
    let retrySub: any;

    const handleRefresh = () => {
      isRefreshing = true;

      const currentRefreshToken = localStorage.getItem('refreshToken');

      if (!currentRefreshToken) {
        isRefreshing = false;
        resolvePendingRequests(null); // Очищаем очередь, чтобы другие запросы не висели
        store.dispatch(logout());
        client.clearStore();
        observer.error(new Error('No refresh token found'));
        return;
      }

      fetch('http://localhost:7000/graphql', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation Refresh($token: String!) {
              refreshToken(token: $token) {
                accessToken
                refreshToken
                user {
                  id
                  login
                  avatar
                }
              }
            }
          `,
          variables: { token: currentRefreshToken }
        })
      })
      .then(async (res) => {
        const result = await res.json();
        
        if (result.errors || !result.data?.refreshToken) {
          throw new Error('Refresh failed');
        }

        const { accessToken, refreshToken, user } = result.data.refreshToken;
      
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        store.dispatch(setCredentials({ accessToken, refreshToken, user }));

        // Перенаправляем заголовки для текущего упавшего запроса
        operation.setContext(({ headers = {} }) => ({
          headers: { ...headers, authorization: `Bearer ${accessToken}` },
        }));

        // Повторяем запрос. Так как мы стоим ПОСЛЕ authLink, forward(operation) уйдет сразу в httpLink
        retrySub = forward(operation).subscribe(observer);
        // ОЧИЩАЕМ КЭШ: Это заставит все активные на экранеuseQuery (включая посты) 
        // автоматически перезапросить данные с сервера с новыми правами!
        // client.refetchQueries({ include: "active" }); 
        // Пропускаем накопившуюся очередь запросов
        resolvePendingRequests(accessToken);
        isRefreshing = false;
      })
      .catch((err) => {
        isRefreshing = false;
        resolvePendingRequests(null); // Сбрасываем очередь с ошибкой
        
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        store.dispatch(logout());
        client.clearStore();
        observer.error(err);
      });
    };

    // Функция-помощник для вкладывания запроса в очередь ожидания токена
    const enqueueRequest = () => {
      pendingRequests.push((token: string | null) => {
        if (token) {
          operation.setContext(({ headers = {} }) => ({
            headers: { ...headers, authorization: `Bearer ${token}` },
          }));
          retrySub = forward(operation).subscribe(observer);
        } else {
          observer.error(new Error('Refresh failed or token missing'));
        }
      });
    };

    // Подписываемся на основной поток выполнения запроса
    sub = forward(operation).subscribe({
      next: (result) => {
        const isUnauthenticated = result.errors?.some(
          (err) => err.extensions?.code === 'UNAUTHENTICATED' || err.message === 'Unauthorized'
        );

        if (isUnauthenticated) {
          if (isRefreshing) {
            enqueueRequest();
          } else {
            handleRefresh();
          }
          
          return;
        } else {
          observer.next(result);
        }
      },
      error: (networkError) => {
        const is401 = networkError.statusCode === 401 || networkError.message?.includes('401');
        
        if (is401) {
          if (isRefreshing) {
            enqueueRequest(); // ИСПРАВЛЕНО: Сетевые ошибки 401 теперь тоже ждут своей очереди
          } else {
            handleRefresh();
          }
        } else {
           observer.error(networkError);
        }
      },
      complete: () => {
        // ИСПРАВЛЕНО: Не вызываем complete, если запрос ушел на повторный цикл (retrySub),
        // иначе хуки useQuery/useMutation в компонентах закроются раньше времени.
        if (!isRefreshing && !retrySub) {
          observer.complete();
        }
      },
    });

    return () => {
      if (sub) sub.unsubscribe();
      if (retrySub) retrySub.unsubscribe();
    };
  });
});

// 3. Добавление токена к исходящим запросам
const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('token');
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }));

  return forward(operation);
});

// 4. WebSocket Link
const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:7000/graphql',
  connectionParams: () => {
    const token = localStorage.getItem('token');
    return {
      authorization: token ? `Bearer ${token}` : "",
    };
  },
}));

// 5. Собираем HTTP цепочку в правильном порядке
const combinedHttpLink = ApolloLink.from([
  authLink,    // 1. Сначала навешиваем заголовки
  refreshLink, // 2. Перехватываем ошибки и при необходимости обновляем токены
  httpLink     // 3. Отправляем данные по сети
]);

// 6. Split Link (Разделение HTTP и WS)
const splitLink = ApolloLink.split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  combinedHttpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

function MainApp() {
  const { isAuthLoading } = useAuthInit();

  if (isAuthLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <h3>Authorization...</h3>
      </div>
    );
  }
  return <MUForum />;
}

function App() {
  return (
    <ApolloProvider client={client}>
      <MainApp />
    </ApolloProvider>
  );
}

export default App;



// let isRefreshing = false;
// let pendingRequests: any[] = [];

// const resolvePendingRequests = (token: string | null) => {
//   pendingRequests.forEach((callback) => callback(token));
//   pendingRequests = [];
// };

// // Используем обычный ApolloLink вместо ErrorLink для полного контроля
// const refreshLink = new ApolloLink((operation, forward) => {
//   return new Observable((observer) => {
//     let sub: any;
//     let retrySub: any;

//     const handleRefresh = () => {
//       isRefreshing = true;

//       // 1. Берем РЕФРЕШ токен из хранилища
//       const currentRefreshToken = localStorage.getItem('refreshToken');

//       // Если его нет — сразу на выход
//       if (!currentRefreshToken) {
//         isRefreshing = false;
//         store.dispatch(logout());
//         client.clearStore();
//         observer.error(new Error('No refresh token found'));
//         return;
//       }

//       // 2. Делаем запрос к GraphQL мутации
//       fetch('http://localhost:7000/graphql', { 
//         method: 'POST', 
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           query: `
//             mutation Refresh($token: String!) {
//               refreshToken(token: $token) {
//                 accessToken
//                 refreshToken
//                 user {
//                   id
//                   login
//                   avatar
//                 }
//               }
//             }
//           `,
//           variables: { token: currentRefreshToken }
//         })
//       })
//       .then(async (res) => {
//         const result = await res.json();
//         console.log(result);
//         // Проверяем ошибки GraphQL или отсутствие данных
//         if (result.errors || !result.data?.refreshToken) {
//           throw new Error('Refresh failed');
//         }

//         const { accessToken, refreshToken, user } = result.data.refreshToken;
      
//         // 3. Сохраняем НОВУЮ ПАРУ токенов
//         localStorage.setItem('token', accessToken);
//         localStorage.setItem('refreshToken', refreshToken);
        
//         store.dispatch(setCredentials({ accessToken, refreshToken, user })); // если используешь Redux для токена

//         resolvePendingRequests(accessToken);
//         isRefreshing = false;

//         // Повторяем упавший запрос с новым ACCESS токеном
//         operation.setContext(({ headers = {} }) => ({
//           headers: { ...headers, authorization: `Bearer ${accessToken}` },
//         }));

//         retrySub = forward(operation).subscribe(observer);
//       })
//       .catch((err) => {
//         isRefreshing = false;
//         resolvePendingRequests(null);
        
//         // Полная очистка при провале рефреша
//         localStorage.removeItem('token');
//         localStorage.removeItem('refreshToken');
//         store.dispatch(logout());
//         client.clearStore();
//         observer.error(err);
//       });
//     };

//     // Остальная логика sub = forward(operation).subscribe(...) остается БЕЗ ИЗМЕНЕНИЙ
//     sub = forward(operation).subscribe({
//       next: (result) => {
//         const isUnauthenticated = result.errors?.some(
//           (err) => err.extensions?.code === 'UNAUTHENTICATED' || err.message === 'Unauthorized'
//         );

//         if (isUnauthenticated) {
//           if (isRefreshing) {
//             pendingRequests.push((token: string | null) => {
//               if (token) {
//                 operation.setContext(({ headers = {} }) => ({
//                   headers: { ...headers, authorization: `Bearer ${token}` },
//                 }));
//                 retrySub = forward(operation).subscribe(observer);
//               } else {
//                 observer.error(new Error('Refresh failed'));
//               }
//             });
//           } else {
//             handleRefresh();
//           }
//         } else {
//           observer.next(result);
//         }
//       },
//       error: (networkError) => {
//         if (networkError.statusCode === 401 || networkError.message?.includes('401')) {
//            handleRefresh();
//         } else {
//            observer.error(networkError);
//         }
//       },
//       complete: () => {
//         if (!isRefreshing) observer.complete();
//       },
//     });

//     return () => {
//       if (sub) sub.unsubscribe();
//       if (retrySub) retrySub.unsubscribe();
//     };
//   });
// });

// // 3. Аналог prepareHeaders: Добавление токена
// const authLink = new ApolloLink((operation, forward) => {
//   const token = localStorage.getItem('token');
//   // В ApolloLink мы меняем контекст через setContext у самой операции
//   operation.setContext(({ headers = {} }) => ({
//     headers: {
//       ...headers,
//       authorization: token ? `Bearer ${token}` : "",
//     }
//   }));

//   return forward(operation);
// });

// // 4. WebSocket Link
// const wsLink = new GraphQLWsLink(createClient({
//   url: 'ws://localhost:7000/graphql',
//   connectionParams: () => {
//     const token = localStorage.getItem('token');
//     return {
//       authorization: token ? `Bearer ${token}` : "",
//     };
//   },
// }));

// // 5. Собираем HTTP цепочку: Error -> Auth -> Http
// const combinedHttpLink = ApolloLink.from([
//   // errorLink, // ПЕРВЫМ (он перехватывает ответ от сервера)
//   refreshLink,
//   authLink,  // ВТОРЫМ (он добавляет заголовки к запросу)
//   httpLink   // ПОСЛЕДНИМ (он отправляет запрос)
// ]);

// // 6. Split Link (разводящий)
// const splitLink = ApolloLink.split(
//   ({ query }) => {
//     const definition = getMainDefinition(query);
//     return (
//       definition.kind === 'OperationDefinition' &&
//       definition.operation === 'subscription'
//     );
//   },
//   wsLink,
//   combinedHttpLink,
// );

// const client = new ApolloClient({
//   link: splitLink,
//   cache: new InMemoryCache(),
// });

// function App() {
//   return (
//     <ApolloProvider client={client}>
//       <MUForum/>
//     </ApolloProvider>
//   );
// }

// export default App;


// 2. Аналог baseQueryWithReauth: Перехватчик ошибок
// const errorLink = new ErrorLink(({ error }) => {
//   // 1. Проверяем, является ли это ошибкой GraphQL (наш UNAUTHENTICATED)
//   if (CombinedGraphQLErrors.is(error)) {
//     // В новом API массив ошибок лежит в error.errors
//     error.errors.forEach((err) => {
//       console.log("Найдена ошибка GraphQL:", err.extensions?.code);

//       if (err.extensions?.code === 'UNAUTHENTICATED' || err.message === 'Unauthorized') {
//         console.log("!!! СЕССИЯ ИСТЕКЛА: ВЫПОЛНЯЮ LOGOUT !!!");
        
//         // Очищаем Redux
//         store.dispatch(logout());
//         client.clearStore()
//         // Очищаем кэш Apollo (обязательно для перерендера)
//         // Мы не можем вызвать client здесь напрямую, но можем через глобальный инстанс
//         // или просто дождаться обновления стейта Redux
//       }
//     });
//   } 
//   // 2. Если это сетевая ошибка (например, сервер упал или 401 на уровне HTTP)
//   else {
//     console.error(`[Network error]: ${error}`);
//     // Если в тексте сетевой ошибки есть 401 - тоже выходим
//     if (error.toString().includes('401')) {
//         store.dispatch(logout());
//         client.clearStore()
//     }
//   }
// });
// let isRefreshing = false;
// let pendingRequests: any[] = [];

// const resolvePendingRequests = (token: string | null) => {
//   pendingRequests.forEach((callback) => callback(token));
//   pendingRequests = [];
// };