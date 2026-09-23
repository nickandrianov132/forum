import { Navigate, Route, Routes } from "react-router";
import { authRoutes, publicRoutes } from "../../utils/routes.ts";
import { ONE_POST_ROUTE } from "../../utils/constants.ts";
import PostDetail from "../../pages/posts/PostDetail.tsx";
import { useAppSelector } from "../../store/hooks.ts";


const AppRouter = () => {
    const {user} = useAppSelector(state => state.user)

    return (
        <div className="lg:col-span-4 space-y-6">
            <Routes>
                {user && authRoutes.map(({path, Component}) => 
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
