import { useMutation } from "@apollo/client/react";
import { PING_ONLINE_MUTATION } from "../graphql/mutations/pingOnline"
import { useAppSelector } from "../store/hooks";
import { useEffect } from "react";


export const useOnlineHeartbeat = () => {
    const [pingOnline] = useMutation(PING_ONLINE_MUTATION);

    const { accessToken } = useAppSelector(state => state.user);
    const isAuth = !!accessToken;

    useEffect(() => {
        if (!isAuth) return;

        // 1. Первый пинг при загрузке приложения для обновления lastSeen
        pingOnline().catch((err) => console.error('[Heartbeat] First ping failure:', err));

        // 2. Редкий фоновый пульс — раз в 1.5 минуты
        const intervalId = setInterval(() => {
        if (document.visibilityState === 'visible') {
            pingOnline().catch((err) => console.error('[Heartbeat] Sending ping failure:', err));
        }
        }, 90000); 

        // Чистим за собой ресурсы
        return () => {
        clearInterval(intervalId);
        };
    }, [isAuth, pingOnline]);


    // useEffect(() => {
    //     if (!isAuth) return;
    //     //1. первый пинг при загрузку приложения или авторизации:
    //     pingOnline().catch((err) => console.error('[Heartbeat] First ping failure:', err));
    //     //2. задаем интервал пульса 12 сек:
    //     const intervalId = setInterval(() => {
    //         // проверка на активную вкладку
    //         if (document.visibilityState === 'visible') {
    //             pingOnline().catch((err) => console.error('[Heartbeat] Sending ping failure:', err));
    //         }
    //     }, 12000);
    //     //3. обработка фонового поведения для mobile apps (Telegram, Watsap...)
    //     const handleVisibilityChange = () => {
    //         // если пользователь вернулся в приложение (развернул Telegram или открыл вкладку)
    //         if (document.visibilityState === 'visible') {
    //             console.log('[Heartbeat] Application is active send ping online...');
    //             pingOnline().catch(() => {});
    //         }
    //     };
    //     document.addEventListener('visibilitychange', handleVisibilityChange);
    //     // чистим за собой интервал и слушатели при логауте или размонтировании
    //     return () => {
    //         clearInterval(intervalId);
    //         document.removeEventListener('visibilitychange', handleVisibilityChange);
    //     };

    // }, [isAuth, pingOnline]);
};