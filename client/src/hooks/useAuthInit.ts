import { useApolloClient, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { GET_ME, USER_HEADER_FRAGMENT } from "../graphql/querry/getAuth";
import { logout, setCredentials } from "../store/slices/authSlice";
import type { UserHeaderFieldsFragment } from "../gql/graphql";


export function useAuthInit() {
    const dispatch = useDispatch();
    const client = useApolloClient();
    const [isReady, setIsReady] = useState(false);

    // 1. Убираем useMemo с пустым массивом для токенов, 
    // либо привязываем его к состоянию готовности, чтобы не блокировать чтение.
    // На самом деле, читать localStorage раз в рендер — это абсолютно не накладно.
    const accessToken = localStorage.getItem('token') || '';
    const refreshToken = localStorage.getItem('refreshToken') || '';
    
    const hasToken = !!accessToken;

    // 2. КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ: Если приложение УЖЕ инициализировано (isReady),
    // мы пропускаем (skip) этот запрос навсегда, чтобы он не стрелял при логинах нового юзера!
    const { loading, error, data } = useQuery(GET_ME, {
        skip: !hasToken || isReady, 
        errorPolicy: 'all',
        fetchPolicy: 'network-only' // гарантирует, что при старте мы проверим токен на сервере, а не в кэше
    });

    useEffect(() => {
        // Если уже готовы — ничего не делаем
        if (isReady) return;

        // Сценарий 1: Токена нет — завершаем
        if (!hasToken) {
            setIsReady(true);
            return;
        }

        if (loading) return;

        if (error || !data?.me) {
            dispatch(logout());
            client.clearStore();
            setIsReady(true);
            return;
        }

        const user = client.readFragment<UserHeaderFieldsFragment>({
            id: client.cache.identify(data.me),
            fragment: USER_HEADER_FRAGMENT,
        });

        if (user) {
            // Пишем АКТУАЛЬНЫЕ токены, а не застрявшие в мемоизации
            dispatch(setCredentials({
                accessToken: accessToken,
                refreshToken: refreshToken,
                user
            }));
            setIsReady(true);
        } else {
            dispatch(logout());
            client.clearStore();
            setIsReady(true);
        }
    // Добавляем актуальные переменные в зависимости
    }, [loading, error, data, hasToken, accessToken, refreshToken, isReady, dispatch, client]);

    const isAuthLoading = !isReady; // Упрощаем лоадер: пока не готовы — показываем экран загрузки
    
    return { isAuthLoading };
}

