import { useAppSelector } from "../../../../store/hooks";
import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";
import ChatHeader from "./ChatHeader";

const ForumChat = () => {
    const { user } = useAppSelector((state) => state.user);
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
