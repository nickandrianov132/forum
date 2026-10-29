import { useMutation, useQuery, useSubscription } from "@apollo/client/react";
import { GET_MESSAGES } from "../../../../graphql/querry/getMessages";
import { useEffect, useRef } from "react";
import { MESSAGE_SUBSCRIPTION } from "../../../../graphql/subscriptions/onMessageAdded";
import { useAppSelector } from "../../../../store/hooks";
import { MESSAGE_DELETED_SUBSCRIPTION } from "../../../../graphql/subscriptions/onMessageDeleted";
import type { GetMessagesQuery, OnMessageDeletedSubscription } from "../../../../gql/graphql";
import { DELETE_MESSAGE } from "../../../../graphql/mutations/deleteMessage";
// import type { GetMessagesQuery } from "../../../../gql/graphql";

// type MessageType = GetMessagesQuery["messages"][number];

const ChatBody = () => {
    const { user } = useAppSelector((state) => state.user);
    const {data, loading, subscribeToMore} = useQuery(GET_MESSAGES);
    const [deleteMessage, {error: deleteError, loading: deleteLoading}] = useMutation(DELETE_MESSAGE);
    const chatContainerRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        const container = chatContainerRef.current;
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            })
        }
    }
    useEffect(() => {
        scrollToBottom();
    },[data?.messages])

    useEffect(() => {
        const unsubscribeAdded = subscribeToMore({
            document: MESSAGE_SUBSCRIPTION,
            updateQuery: (prev, { subscriptionData }) => { 
            if (!subscriptionData.data) return prev;
            
            const newMessage = subscriptionData.data.messageAdded;

            const currentMessages = (prev.messages || []) as any[];

            if (currentMessages.some(msg => msg.id === newMessage.id)) {
                return prev;
            }

            return {
                ...prev,
                messages: [...currentMessages, newMessage]
            } as any;
            },
        });

        
        return () => {
            unsubscribeAdded();
        }
    }, [subscribeToMore]);

// Подписка на удаление сообщения
    useSubscription<OnMessageDeletedSubscription>(MESSAGE_DELETED_SUBSCRIPTION, {
    onData: ({ client, data }) => {
        // Если данных от вебсокета нет или сообщение не определено — ничего не делаем
        if (!data.data?.messageDeleted) return;

        const deletedMessageId = data.data.messageDeleted.id;

        // Читаем текущее состояние кэша для запроса GET_MESSAGES
        const existingData = client.readQuery<GetMessagesQuery>({
        query: GET_MESSAGES,
        });

        if (existingData && existingData.messages) {
        // Перезаписываем кэш Apollo напрямую отфильтрованным массивом
        client.writeQuery<GetMessagesQuery>({
            query: GET_MESSAGES,
            data: {
            ...existingData,
            messages: existingData.messages.filter(msg => msg?.id !== deletedMessageId),
            },
        });
        }
    },
    });

    const handlerDeleteMessage = async (msgId: string) => {
        try {
            await deleteMessage({
                variables: {
                    id: msgId
                }
            })
            
        } catch (error: any) {
            console.log(error.message);
        }
    }

    if (loading || !data) return <div>Загрузка сообщений...</div>;

    return (
        <div className="flex flex-col h-70 bg-slate-900 text-white p-2 ">
            <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto space-y-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-900 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                {data.messages.map((msg) => (
                    <div key={msg.id}>
                    {msg.user.id === user?.id
                        ?
                        <div key={msg.id} className="flex justify-end items-start gap-1.5">
                            <div>
                                <div className="flex justify-end items-center gap-2">
                                    {user.id === msg?.userId &&
                                        <span
                                            onClick={() => {handlerDeleteMessage(msg.id)}}
                                        >
                                            <svg 
                                                xmlns="http://w3.org" 
                                                fill="none" 
                                                viewBox="0 0 24 24" 
                                                strokeWidth="2" 
                                                stroke="currentColor" 
                                                className="w-5 h-5 text-slate-300 hover:text-red-500 transition-colors duration-200 cursor-pointer"
                                                >
                                                <circle cx="12" cy="12" r="9" />

                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L15 9M9 9l6 6" />
                                                </svg>
                                        </span>

                                    }
                                    <span className="font-bold text-xs text-indigo-400">{msg.user.login}</span>
                                </div>
                                <p className="text-xs text-slate-200 mt-2! py-1! px-2! bg-slate-800 rounded-md max-w-md">
                                    {msg.text}
                                </p>
                            </div>
                            <img 
                                src={msg.user.avatar} 
                                alt={msg.user.login} 
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        </div>
                        :
                        <div key={msg.id} className="flex items-start gap-1.5">
                            <img 
                                src={msg.user.avatar} 
                                alt={msg.user.login} 
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-indigo-400">{msg.user.login}</span>
                                </div>
                                <p className="text-xs text-slate-200 mt-2! py-1! px-2! bg-slate-800 rounded-md max-w-md">
                                    {msg.text}
                                </p>
                            </div>
                        </div>
                    }
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChatBody;
