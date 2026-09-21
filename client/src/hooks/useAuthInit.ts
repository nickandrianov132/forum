import { useApolloClient, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { GET_ME, USER_HEADER_FRAGMENT } from "../graphql/querry/getAuth";
import { logout, setCredentials } from "../store/slices/authSlice";
import { useFragment } from "../gql";
import type { UserHeaderFieldsFragment } from "../gql/graphql";


export function useAuthInit() {
    const dispatch = useDispatch();
    const client = useApolloClient(); // Достаем инстанс клиента прямо из контекста Apollo
    const [isReady, setIsReady] = useState(false);

    // 1. Читаем токены один раз за рендер и мемоизируем их, 
    // чтобы не дергать localStorage внутри эффектов и не плодить новые ссылки
    const tokens = useMemo(() => {
        return {
            accessToken: localStorage.getItem('token') || '',
            refreshToken: localStorage.getItem('refreshToken') || ''
        }
    }, [])

    const hasToken = !!tokens.accessToken;

    const { loading, error, data } = useQuery(GET_ME, {
        skip: !hasToken,
        errorPolicy: 'all'
    });

    useEffect(() => {
        // Сценарий 1: Токена нет — сразу завершаем инициализацию
        if (!hasToken) {
            setIsReady(true);
            return
        }

        // Ждем, пока Apollo завершит запрос (исчезнет loading)
        if (loading) return;

        if (error || !data?.me) {
            dispatch(logout());
            client.clearStore();
            setIsReady(true);
            return
        }

        const user = client.readFragment<UserHeaderFieldsFragment>({
            id: client.cache.identify(data.me),
            fragment: USER_HEADER_FRAGMENT,
        });
        if (user) {
            dispatch(setCredentials({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user
            }));
            setIsReady(true);
        } else {
            dispatch(logout());
            client.clearStore();
            setIsReady(true);
        }


    }, [loading, error, data, hasToken, tokens, dispatch, client]);

    const isAuthLoading = loading && !isReady;
    
    return { isAuthLoading }
}