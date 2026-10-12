import { useQuery } from "@apollo/client/react";
import { GET_MESSAGES } from "../../../../graphql/querry/getMessages";
import { useEffect, useRef } from "react";
import { MESSAGE_SUBSCRIPTION } from "../../../../graphql/subscriptions/onMessageAdded";
import { useAppSelector } from "../../../../store/hooks";
// import type { GetMessagesQuery } from "../../../../gql/graphql";

// type MessageType = GetMessagesQuery["messages"][number];

const ChatBody = () => {
    const { user } = useAppSelector((state) => state.user);
    const {data, loading, subscribeToMore} = useQuery(GET_MESSAGES);
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
    const unsubscribe = subscribeToMore({
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

    return () => unsubscribe();
    }, [subscribeToMore]);

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
