import { Routes, Route, Navigate } from "react-router-dom";
import { authRoutes, publicRoutes } from "../routes";
import { useContext, useEffect, useState } from "react";
import { Context } from "../layout";
import { check } from "@/app/http/userAPI";

const AppRouter = () => {
    const { user, setUser, setIsAuth } = useContext(Context);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const { user: authUser, token } = await check();
                setUser(authUser);
                setIsAuth(true);
            } catch {
                setIsAuth(false);
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, [setIsAuth, setUser]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Routes>
            {user.isAuth &&
                authRoutes.map(({ path, Component }) => (
                    <Route
                        key={path}
                        path={path}
                        element={<Component />}
                        exact
                    />
                ))}

            {publicRoutes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} exact />
            ))}

            <Route
                path="*"
                element={<Navigate to={user.isAuth ? "/" : "/login"} />}
            />
        </Routes>
    );
};

export default AppRouter;
