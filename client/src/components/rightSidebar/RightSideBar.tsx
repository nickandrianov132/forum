import ForumChat from "./content/Chat/ForumChat";

const RightSideBar = () => {
    return (
        <aside className='right-bar'>
            <div className="bg-gray-800 p-4 rounded-r-md h-fit lg:h-full">
                <ForumChat />
            </div>
        </aside>
    );
}

export default RightSideBar;
