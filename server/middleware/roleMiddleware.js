import * as ROLES from "../rolesConfing.js";

const roleRequirements = {
    //Пользователи
    "POST /api/users/registration": [ROLES.ADMIN],
    "PUT /api/users/": [ROLES.ADMIN, ROLES.INSTRUCTOR],
    "DELETE /api/users/": [ROLES.ADMIN],
    //Группы
    "POST /api/groups/": [ROLES.ADMIN],
    "PUT /api/groups/": [ROLES.ADMIN, ROLES.MODERATOR],
    "DELETE /api/groups/": [ROLES.ADMIN],
    // Команды
    "POST /api/teams/": [
        ROLES.USER,
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    "PUT /api/teams/": [
        ROLES.USER,
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    "DELETE /api/teams/": [
        ROLES.USER,
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    // Задания
    "POST /api/assignments/": [ROLES.ADMIN, ROLES.MODERATOR, ROLES.INSTRUCTOR],
    "PUT /api/assignments/": [ROLES.ADMIN, ROLES.MODERATOR, ROLES.INSTRUCTOR],
    "DELETE /api/assignments/": [
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    // Сдача Заданий
    "POST /api/submissions/": [
        ROLES.USER,
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    "PUT /api/submissions/": [
        ROLES.USER,
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    "DELETE /api/submissions/": [
        ROLES.USER,
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    // Публикации
    "POST /api/publications/": [
        ROLES.USER,
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    "PUT /api/publications/": [
        ROLES.USER,
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    "DELETE /api/publications/": [
        ROLES.USER,
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    //Звонки пользователям
    "GET /api/conferences/": [ROLES.ADMIN, ROLES.MODERATOR],
    //Собрания внутри команды
    "GET /api/teamconferences/": [ROLES.ADMIN, ROLES.MODERATOR],
};

export default function () {
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
            return next();
        }

        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        let routeKey = `${req.method} ${req.baseUrl}${req.path}`;
        console.log("Normalized Route Key:", routeKey);

        const requiredRole = roleRequirements[routeKey];
        const userRole = (req.user.role.name || req.user.role).toUpperCase();

        console.log("Required Role:", requiredRole);
        console.log("User Role:", userRole);

        const isAuthorized = Array.isArray(requiredRole)
            ? requiredRole.map((r) => r.toUpperCase()).includes(userRole)
            : userRole === requiredRole.toUpperCase();

        if (!isAuthorized) {
            console.log(12345);
            return res
                .status(403)
                .json({ message: "Нет доступа, недостаточно прав" });
        }

        next();
    };
}
