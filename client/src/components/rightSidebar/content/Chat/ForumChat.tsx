import { useQuery } from "@apollo/client/react";
import { useAppSelector } from "../../../../store/hooks";
import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";
import ChatHeader from "./ChatHeader";
import { GET_MESSAGES } from "../../../../graphql/querry/getMessages";

const ForumChat = () => {
    const { user } = useAppSelector((state) => state.user);
    const { loading } = useQuery(GET_MESSAGES);
    
    if(loading) return (
        <div className="flex flex-col h-70 bg-slate-900/40 border border-white/5 rounded-xl animate-pulse"></div>
    )

    return (
        <div className='flex flex-col rounded-md overflow-hidden' >
            <ChatHeader />
            <ChatBody />
            {user && !user.isBanned &&
                <ChatFooter />
            }
        </div>
    );
}

export default ForumChat;
