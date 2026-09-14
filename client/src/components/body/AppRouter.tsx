import { Navigate, Route, Routes } from "react-router";
import { authRoutes, publicRoutes } from "../../utils/routes.ts";
import News from "../../pages/News";
import { ONE_POST_ROUTE } from "../../utils/constants.ts";
import PostDetail from "../../pages/PostDetail.tsx";
// import { POSTS_ROUTE } from "../../utils/constants.ts";
// import PostDetail from "../../pages/PostDetail.tsx";

const AppRouter = () => {
    const isAuth = true

    return (
        <div className="lg:col-span-4 space-y-6">
            <Routes>
                {isAuth && authRoutes.map(({path, Component}) => 
                    <Route key={path} path={path} element={<Component/>} />
                )}
                {publicRoutes.map(({path, Component}) =>
                    <Route key={path} path={path} element={<Component/>} />
                )}

                {/* Конкретный пост - отдельный роут (список Posts исчезнет) */}
                <Route path={ONE_POST_ROUTE} element={<PostDetail />} />
                <Route path="*" element={<Navigate to="/posts/off-topic" replace />} />
                {/* <Route path="*" element={<News/>} /> */}
            </Routes>
        </div>
    );
}

export default AppRouter;
