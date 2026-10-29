import ForumChat from "./content/Chat/ForumChat";
import UsersOnline from "./content/OnlineSection/UsersOnline";

const RightSideBar = () => {
    return (
        <aside className='right-bar'>
            <div className="bg-gray-800 p-4 rounded-r-md h-fit lg:h-full">
                <ForumChat />
                <UsersOnline />
            </div>
        </aside>
    );
}

export default RightSideBar;
