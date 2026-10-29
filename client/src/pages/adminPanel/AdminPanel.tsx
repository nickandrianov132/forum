import { Link, Outlet } from "react-router";
import { ADMIN_PANEL, ADMIN_PANEL_CATEGORY, ADMIN_PANEL_UNBAN, ADMIN_PANEL_USERS } from "../../utils/constants";
import { useState } from "react";

type Tab = 'users' | 'ban' | 'unban' | 'category'

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState<Tab>('users')
    return (
        <div className="user-panel-container">
            <nav className="flex gap-2 mb-4">
                <Link 
                    className={activeTab === 'ban' ? 'admin-panel-tab-active' : 'admin-panel-tab'}
                    onClick={() => setActiveTab('ban')}
                    to={ADMIN_PANEL}
                >Ban user</Link>
                <Link 
                    className={activeTab === 'unban' ? 'admin-panel-tab-active' : 'admin-panel-tab'}
                    onClick={() => setActiveTab('unban')}
                    to={ADMIN_PANEL_UNBAN}
                >Unban user</Link>
                <Link 
                    className={activeTab === 'users' ? 'admin-panel-tab-active' : 'admin-panel-tab'}
                    onClick={() => setActiveTab('users')}
                    to={ADMIN_PANEL_USERS}
                >Users</Link>
                <Link 
                    className={activeTab === 'category' ? 'admin-panel-tab-active' : 'admin-panel-tab'}
                    onClick={() => setActiveTab('category')}
                    to={ADMIN_PANEL_CATEGORY}
                >Create Category</Link>
            </nav>
            <Outlet/>
        </div>
    );
}

export default AdminPanel;
