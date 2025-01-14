import { Routes, Route, Navigate } from "react-router-dom";
import { authRoutes } from "../routes";

const AppRouter = () => {
    const isAuth = false;
    return (
        <Routes>
            {isAuth &&
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
        </Routes>
    );
};
