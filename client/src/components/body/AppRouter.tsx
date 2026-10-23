import { Navigate, Route, Routes } from "react-router";
import { authRoutes, publicRoutes } from "../../utils/routes.ts";
import { ADMIN_PANEL, ADMIN_PANEL_BAN, ADMIN_PANEL_CATEGORY, ADMIN_PANEL_UNBAN, ADMIN_PANEL_USERS, ONE_POST_ROUTE } from "../../utils/constants.ts";
import PostDetail from "../../pages/posts/PostDetail.tsx";
import { useAppSelector } from "../../store/hooks.ts";
import AdminPanel from "../../pages/adminPanel/AdminPanel.tsx";
import BanUser from "../../pages/adminPanel/BanUser.tsx";
import UnbanUser from "../../pages/adminPanel/UnbanUser.tsx";
import UsersInfo from "../../pages/adminPanel/UsersInfo.tsx";
import CreateCategory from "../../pages/adminPanel/CreateCategory.tsx";


const AppRouter = () => {
    const {user} = useAppSelector(state => state.user)

    return (
        <div className="router-container">
            <Routes>
                {user && authRoutes.map(({path, Component}) => 
                    <Route key={path} path={path} element={<Component/>} />
                )}
                {publicRoutes.map(({path, Component}) =>
                    <Route key={path} path={path} element={<Component/>} />
                )}

                {/* Конкретный пост - отдельный роут (список Posts исчезнет) */}
                <Route path={ONE_POST_ROUTE} element={<PostDetail />} />
                {user && user.role === 'Admin' &&
                    <Route path={ADMIN_PANEL} element={<AdminPanel />}>
                        <Route index element={<BanUser />}/>
                        <Route path={ADMIN_PANEL_UNBAN} element={<UnbanUser />}/>
                        <Route path={ADMIN_PANEL_USERS} element={<UsersInfo />}/>
                        <Route path={ADMIN_PANEL_CATEGORY} element={<CreateCategory />}/>
                    </Route>
                }
                <Route path="*" element={<Navigate to="/posts/off-topic" replace />} />
                {/* <Route path="*" element={<News/>} /> */}
            </Routes>
        </div>
    );
}

export default AppRouter;
