import { Link, Outlet } from "react-router";
import { ADMIN_PANEL, ADMIN_PANEL_CATEGORY, ADMIN_PANEL_UNBAN, ADMIN_PANEL_USERS } from "../../utils/constants";



const AdminPanel = () => {

    return (
        <div className="flex flex-col w-full border border-slate-600/50 rounded-lg py-5 px-4 mt-2 bg-gray-800 h-full">
            <nav className="flex gap-2 mb-4">
                <Link className=" text-slate-300 border border-slate-300/30 rounded-sm px-3 py-1 bg-indigo-700 hover:bg-indigo-600 hover:text-white hover:shadow-xl hover:shadow-violet-600/20 transition-colors"
                    to={ADMIN_PANEL}
                >Ban user</Link>
                <Link className="text-slate-300 border border-slate-300/30 rounded-sm px-3 py-1 bg-indigo-700 hover:bg-indigo-600 hover:text-white hover:shadow-xl hover:shadow-violet-600/20 transition-colors"
                    to={ADMIN_PANEL_UNBAN}
                >Unban user</Link>
                <Link className="text-slate-300 border border-slate-300/30 rounded-sm px-3 py-1 bg-indigo-700 hover:bg-indigo-600 hover:text-white hover:shadow-xl hover:shadow-violet-600/20 transition-colors"
                    to={ADMIN_PANEL_USERS}
                >Users</Link>
                <Link className="text-slate-300 border border-slate-300/30 rounded-sm px-3 py-1 bg-indigo-700 hover:bg-indigo-600 hover:text-white hover:shadow-xl hover:shadow-violet-600/20 transition-colors"
                    to={ADMIN_PANEL_CATEGORY}
                >Create Category</Link>
            </nav>
            <Outlet/>
        </div>
    );
}

export default AdminPanel;
