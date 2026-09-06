// import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
// import { SetContextLink } from '@apollo/client/link/context';
// import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
// import { createClient } from 'graphql-ws';
// import { getMainDefinition } from '@apollo/client/utilities';
// import { ApolloProvider } from '@apollo/client/react';
// import MUForum from './MUForum.tsx';
// import { ApolloLink } from '@apollo/client';

// // 1. Настройка HTTP (для Query и Mutation)
// const httpLink = new HttpLink({
//   uri: 'http://localhost:7000/graphql',
// });

// const authLink = new SetContextLink((_, { headers }: any) => {
//   const token = localStorage.getItem('token');
//   return {
//     headers: {
//       ...headers,
//       authorization: token ? `Bearer ${token}` : "",
//     }
//   };
// });

// // 2. Настройка WebSocket (для Subscriptions)
// const wsLink = new GraphQLWsLink(createClient({
//   url: 'ws://localhost:7000/graphql',
//   connectionParams: () => {
//     const token = localStorage.getItem('token');
//     return {
//       authorization: token ? `Bearer ${token}` : "",
//     };
//   },
// }));

// // 3. Функция-"разводящий" (split)
// // Если операция - подпись, идем в WS, иначе в HTTP
// const splitLink = ApolloLink.split(
//   ({ query }) => {
//     const definition = getMainDefinition(query);
//     return (
//       definition.kind === 'OperationDefinition' &&
//       definition.operation === 'subscription'
//     );
//   },
//   wsLink,
//   authLink.concat(httpLink),
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

// export default App


import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, Observable } from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error'; // <-- Добавь этот импорт
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { ApolloProvider } from '@apollo/client/react';
import MUForum from './MUForum.tsx';
import { logout, setCredentials } from './store/slices/authSlice.ts';
import { store } from './store/store.ts';
import { CombinedGraphQLErrors } from '@apollo/client';

// 1. HTTP Link
const httpLink = new HttpLink({
  uri: 'http://localhost:7000/graphql',
});



let isRefreshing = false;
let pendingRequests: any[] = [];

const resolvePendingRequests = (token: string | null) => {
  pendingRequests.forEach((callback) => callback(token));
  pendingRequests = [];
};


// Используем обычный ApolloLink вместо ErrorLink для полного контроля
const refreshLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    let sub: any;
    let retrySub: any;

    const handleRefresh = () => {
      isRefreshing = true;

      // 1. Берем РЕФРЕШ токен из хранилища
      const currentRefreshToken = localStorage.getItem('refreshToken');

      // Если его нет — сразу на выход
      if (!currentRefreshToken) {
        isRefreshing = false;
        store.dispatch(logout());
        client.clearStore();
        observer.error(new Error('No refresh token found'));
        return;
      }

      // 2. Делаем запрос к GraphQL мутации
      fetch('http://localhost:7000/graphql', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation Refresh($token: String!) {
              refreshToken(token: $token) {
                accessToken
                refreshToken
              }
            }
          `,
          variables: { token: currentRefreshToken }
        })
      })
      .then(async (res) => {
        const result = await res.json();
        
        // Проверяем ошибки GraphQL или отсутствие данных
        if (result.errors || !result.data?.refreshToken) {
          throw new Error('Refresh failed');
        }

        const { accessToken, refreshToken } = result.data.refreshToken;

        // 3. Сохраняем НОВУЮ ПАРУ токенов
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        store.dispatch(setCredentials({ accessToken, refreshToken })); // если используешь Redux для токена

        resolvePendingRequests(accessToken);
        isRefreshing = false;

        // Повторяем упавший запрос с новым ACCESS токеном
        operation.setContext(({ headers = {} }) => ({
          headers: { ...headers, authorization: `Bearer ${accessToken}` },
        }));

        retrySub = forward(operation).subscribe(observer);
      })
      .catch((err) => {
        isRefreshing = false;
        resolvePendingRequests(null);
        
        // Полная очистка при провале рефреша
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        store.dispatch(logout());
        client.clearStore();
        observer.error(err);
      });
    };

    // Остальная логика sub = forward(operation).subscribe(...) остается БЕЗ ИЗМЕНЕНИЙ
    sub = forward(operation).subscribe({
      next: (result) => {
        const isUnauthenticated = result.errors?.some(
          (err) => err.extensions?.code === 'UNAUTHENTICATED' || err.message === 'Unauthorized'
        );

        if (isUnauthenticated) {
          if (isRefreshing) {
            pendingRequests.push((token: string | null) => {
              if (token) {
                operation.setContext(({ headers = {} }) => ({
                  headers: { ...headers, authorization: `Bearer ${token}` },
                }));
                retrySub = forward(operation).subscribe(observer);
              } else {
                observer.error(new Error('Refresh failed'));
              }
            });
          } else {
            handleRefresh();
          }
        } else {
          observer.next(result);
        }
      },
      error: (networkError) => {
        if (networkError.statusCode === 401 || networkError.message?.includes('401')) {
           handleRefresh();
        } else {
           observer.error(networkError);
        }
      },
      complete: () => {
        if (!isRefreshing) observer.complete();
      },
    });

    return () => {
      if (sub) sub.unsubscribe();
      if (retrySub) retrySub.unsubscribe();
    };
  });
});

// const refreshLink = new ApolloLink((operation, forward) => {
//   return new Observable((observer) => {
//     let sub: any;
//     let retrySub: any;

//     const handleRefresh = () => {
//       isRefreshing = true;

//       fetch('http://localhost:7000/refresh', { 
//         method: 'POST', 
//         credentials: 'include' 
//       })
//       .then(async (res) => {
//         if (!res.ok) throw new Error('Refresh failed');
//         const data = await res.json();
//         const newToken = data.accessToken;

//         localStorage.setItem('token', newToken);
//         // store.dispatch(setCredentials({ accessToken: newToken })); 

//         resolvePendingRequests(newToken);
//         isRefreshing = false;

//         // Повторяем запрос с новым токеном
//         operation.setContext(({ headers = {} }) => ({
//           headers: { ...headers, authorization: `Bearer ${newToken}` },
//         }));

//         retrySub = forward(operation).subscribe(observer);
//       })
//       .catch((err) => {
//         isRefreshing = false;
//         resolvePendingRequests(null);
//         store.dispatch(logout());
//         client.clearStore();
//         observer.error(err);
//       });
//     };

//     // 1. Пытаемся выполнить запрос
//     sub = forward(operation).subscribe({
//       next: (result) => {
//         // 2. Проверяем ошибки в ответе (GraphQL Errors)
//         const isUnauthenticated = result.errors?.some(
//           (err) => err.extensions?.code === 'UNAUTHENTICATED' || err.message === 'Unauthorized'
//         );

//         if (isUnauthenticated) {
//           if (isRefreshing) {
//             // Если рефреш уже идет — кладем в очередь
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
//           // Если ошибок нет — отдаем результат дальше
//           observer.next(result);
//         }
//       },
//       error: (networkError) => {
//         // 3. Проверяем сетевые ошибки (HTTP 401)
//         if (networkError.statusCode === 401 || networkError.message?.includes('401')) {
//            handleRefresh();
//         } else {
//            observer.error(networkError);
//         }
//       },
//       complete: () => {
//         // Завершаем только если не было рефреша (там свой сабскрайб)
//         if (!isRefreshing) observer.complete();
//       },
//     });

//     return () => {
//       if (sub) sub.unsubscribe();
//       if (retrySub) retrySub.unsubscribe();
//     };
//   });
// });
// 3. Аналог prepareHeaders: Добавление токена
const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('token');
  // В ApolloLink мы меняем контекст через setContext у самой операции
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

// 5. Собираем HTTP цепочку: Error -> Auth -> Http
const combinedHttpLink = ApolloLink.from([
  // errorLink, // ПЕРВЫМ (он перехватывает ответ от сервера)
  refreshLink,
  authLink,  // ВТОРЫМ (он добавляет заголовки к запросу)
  httpLink   // ПОСЛЕДНИМ (он отправляет запрос)
]);

// 6. Split Link (разводящий)
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

function App() {
  return (
    <ApolloProvider client={client}>
      <MUForum/>
    </ApolloProvider>
  );
}

export default App;


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