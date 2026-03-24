import { Route, Routes } from "react-router";
import { authRoutes, publicRoutes } from "../../utils/routes.ts";
import News from "../../pages/News";
import { POSTS_ROUTE } from "../../utils/constants.ts";
import PostDetail from "../../pages/PostDetail.tsx";

const AppRouter = () => {
    const isAuth = true

    return (
        <div className="router_container">
            <Routes>
                {isAuth && authRoutes.map(({path, Component}) => 
                    <Route key={path} path={path} element={<Component/>} />
                )}
                {publicRoutes.map(({path, Component}) =>
                    <Route key={path} path={path} element={<Component/>} />
                )}

                {/* Конкретный пост - отдельный роут (список Posts исчезнет) */}
                <Route path={`${POSTS_ROUTE}/:id`} element={<PostDetail />} />
                <Route path="*" element={<News/>} />
            </Routes>
        </div>
    );
}

export default AppRouter;
