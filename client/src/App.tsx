import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, Observable } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { ApolloProvider, useMutation } from '@apollo/client/react';
import MUForum from './MUForum.tsx';
import { logout, setCredentials } from './store/slices/authSlice.ts';
import { store } from './store/store.ts';
import { useAuthInit } from './hooks/useAuthInit.ts';
import { useOnlineHeartbeat } from './hooks/useOnlineHeartbeat.ts';
import { PING_ONLINE_MUTATION } from './graphql/mutations/pingOnline.ts';
import { useEffect, useRef } from 'react';


const apiEnv = import.meta.env.VITE_GRAPHQL_URI; 
const HTTP_URI = apiEnv || 'http://localhost:7000/graphql';
const WS_URI = apiEnv 
  ? apiEnv.replace(/^http/, 'ws') 
  : 'ws://localhost:7000/graphql';
// 1. HTTP Link
const httpLink = new HttpLink({
  uri: HTTP_URI,
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

      fetch(HTTP_URI, { 
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
                  role
                  isBanned
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
        // ОЧИЩАЕМ КЭШ: Это заставит все активные на экране useQuery (включая посты) 
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
            enqueueRequest();  // Сетевые ошибки 401 тоже ждут своей очереди
          } else {
            handleRefresh();
          }
        } else {
           observer.error(networkError);
        }
      },
      complete: () => {
        // Не вызываем complete, если запрос ушел на повторный цикл retrySub,
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
 export const wsLink = new GraphQLWsLink(createClient({
    url: WS_URI,
    connectionParams: () => {
      const token = localStorage.getItem('token');
      return {
        authorization: token ? `Bearer ${token}` : "",
      };
    },
    // Добавляем таймаут ожидания пинга от сервера.
    // Если сервер шлет пинг раз в 12 секунд, значение в 10-15 секунд на клиенте
    // заставит Apollo Client держать сокет "разогретым" и автоматически отвечать на pong.
    keepAlive: 10000,
    // Позволяет сокету пытаться переподключиться при закрытии соединения
    shouldRetry: () => true, 

    // Бесконечное число попыток переподключения при случайном обрыве связи (F5, лифт, метро)
    retryAttempts: 10,
      
    on: {
        // 1. Метод синхронный, event имеет тип unknown — как и требует graphql-ws
        closed: (event: unknown) => {
          
          // 2. Проверка на объект с числовым полем code
          if (
            event && 
            typeof event === 'object' && 
            'code' in event && 
            event.code === 4403
          ) {
            console.log('WS Connection closed due to 4403. Attempting to refresh token...');

            const currentRefreshToken = localStorage.getItem('refreshToken');
            if (!currentRefreshToken) return;

            // 3.  асинхронная логика упакована внутрь самовызывающейся функции IIFE
            (async () => {
              try {
                const res = await fetch(HTTP_URI, { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    query: `
                      mutation Refresh($token: String!) {
                        refreshToken(token: $token) {
                          accessToken
                          refreshToken
                          user { id login avatar role isBanned }
                        }
                      }
                    `,
                    variables: { token: currentRefreshToken }
                  })
                });

                const result = await res.json();
                
                if (result.data?.refreshToken) {
                  const { accessToken, refreshToken, user } = result.data.refreshToken;
                  
                  localStorage.setItem('token', accessToken);
                  localStorage.setItem('refreshToken', refreshToken);
                  store.dispatch(setCredentials({ accessToken, refreshToken, user }));
                  
                  console.log('Token successfully refreshed for WS. Reconnecting...');
                }
              } catch (err) {
                console.error('Failed to refresh token during WS connection closure:', err);
              }
            })();
          }
        }
      }
  }));

// // 5.  HTTP цепочка в правильном порядке
// const combinedHttpLink = ApolloLink.from([
//   authLink,    // 1. Сначала навешиваем заголовки
//   refreshLink, // 2. Перехватываем ошибки и при необходимости обновляем токены
//   httpLink     // 3. Отправляем данные по сети
// ]);

///  сменил порядок: проверить!
const combinedHttpLink = ApolloLink.from([
  refreshLink,   // 1. Первым принимает ответ сервера и ловит ошибки авторизации
  authLink,      // 2. Вторым берет СВЕЖИЙ токен из localStorage и крепит к заголовкам
  httpLink       // 3. Отправляет готовый запрос в сеть
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

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Указываем поведение для этого конкретного запроса
          getOnlineUsers: {
            // Этим мы говорим - просто бери новые данные и затирай старые
              merge(existing, incoming) {
              return incoming;
            }
          }
        }
      }
    }
  }),
});

function MainApp() {
  const { isAuthLoading } = useAuthInit();
  // 1. Переносим хук мутации сюда — теперь он строго ПОД ApolloProvider!
  const [sendPing] = useMutation(PING_ONLINE_MUTATION);
  // Создаем "память" для таймстампа последнего успешного пинга
  const lastPingTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isAuthLoading) return;

    // Безопасная функция отправки пинга с ограничением частоты (Throttle)
    const executePingWithThrottle = async (isForced = false) => {
      const now = Date.now();
      const timeSinceLastPing = now - lastPingTimeRef.current;

      // Шлем запрос ТОЛЬКО если прошло больше 20 секунд с последнего пинга
      // ИЛИ если это принудительный пинг (например, при самом первом входе)
      if (isForced || timeSinceLastPing >= 20000) {
        try {
          lastPingTimeRef.current = now; // Сразу обновляем время, чтобы заблокировать спам
          await sendPing();
          console.log("[Ping System] -> Пульс успешно отправлен на бэкенд.");
        } catch (error) {
          console.log("[Ping Error] Ошибка отправки пульса:", error);
        }
      }
    };

    // 1. Первый пинг при загрузке приложения (принудительный)
    executePingWithThrottle(true);

    // 2. Фоновый интервал: держит онлайн каждые 20 секунд, если пользователь отошел, но вкладка открыта
    const interval = setInterval(() => {
      executePingWithThrottle();
    }, 20000);

    // 3. Обработчик активности: сработает при клике/нажатии, 
    // но функция executePingWithThrottle пропустит его на сервер, только если пришло время!
    const handleActivity = () => {
      executePingWithThrottle();
    };

    window.addEventListener('focus', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [sendPing, isAuthLoading]);

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
