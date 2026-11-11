import ForumChat from "./content/Chat/ForumChat";
import UsersOnline from "./content/OnlineSection/UsersOnline";

const RightSideBar = () => {
    return (
        <aside className='right-bar'>
            <div className="bg-gray-800 p-4 border border-slate-600/50 mt-2 lg:mt-0 rounded-r-md rounded-l-md lg:rounded-none lg:rounded-r-md h-fit lg:h-full">
                <ForumChat />
                <UsersOnline />
            </div>
        </aside>
    );
}

export default RightSideBar;
