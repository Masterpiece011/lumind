import * as ROLES from "../rolesConfing.js";

const roleRequirements = {
    //Пользователи
    "POST /api/users/registration": [ROLES.ADMIN],
    "PUT /api/users/": [ROLES.ADMIN, ROLES.INSTRUCTOR],
    "DELETE /api/users/:id": [ROLES.ADMIN],

    //Группы
    "POST /api/groups/": [ROLES.ADMIN],
    "POST /api/groups/create": [ROLES.ADMIN],
    "GET /api/groups/:id": [ROLES.ADMIN, ROLES.MODERATOR],
    "PUT /api/groups/": [ROLES.ADMIN, ROLES.MODERATOR],
    "DELETE /api/groups/:id": [ROLES.ADMIN],

    // Команды
    "POST /api/teams/create": [
        ROLES.USER,
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    "GET /api/teams/:id": [
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
    "DELETE /api/teams/:id": [
        ROLES.USER,
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],

    // Пользователи и команды
    "POST /api/users-teams/create": [
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    "POST /api/users-teams/": [
        ROLES.USER,
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    "GET /api/users-teams/:id": [
        ROLES.USER,
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    "PUT /api/users-teams/": [ROLES.ADMIN, ROLES.MODERATOR],
    "DELETE /api/users-teams/:id": [ROLES.ADMIN, ROLES.MODERATOR],

    // Команды и задания
    "POST /api/teams-tasks/create": [
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    "POST /api/teams-tasks/": [ROLES.ADMIN, ROLES.MODERATOR, ROLES.INSTRUCTOR],
    "GET /api/teams-tasks/:id": [
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    "PUT /api/teams-tasks/": [ROLES.ADMIN, ROLES.MODERATOR, ROLES.INSTRUCTOR],
    "DELETE /api/teams-tasks/:id": [
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],

    // Задания
    "POST /api/tasks/create": [ROLES.ADMIN, ROLES.MODERATOR, ROLES.INSTRUCTOR],
    "POST /api/tasks/": [ROLES.ADMIN, ROLES.MODERATOR, ROLES.INSTRUCTOR],
    "GET /api/tasks/:id": [ROLES.ADMIN, ROLES.MODERATOR, ROLES.INSTRUCTOR],
    "PUT /api/tasks/": [ROLES.ADMIN, ROLES.MODERATOR, ROLES.INSTRUCTOR],
    "DELETE /api/tasks/:id": [ROLES.ADMIN, ROLES.MODERATOR, ROLES.INSTRUCTOR],

    // Назначения
    "POST /api/assignments/create": [
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    "POST /api/assignments/": [
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
        ROLES.USER,
    ],
    "POST /api/assignments/get-self": [
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
        ROLES.USER,
    ],
    "POST /api/assignments/get-team-assignments": [
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
        ROLES.USER,
    ],
    "POST /api/assignments/instructor/assignments": [
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    "POST /api/assignments/instructor/students": [
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    "GET /api/assignments/instructor/assignment/:id": [
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
    ],
    "PUT /api/assignments/": [
        ROLES.ADMIN,
        ROLES.MODERATOR,
        ROLES.INSTRUCTOR,
        ROLES.USER,
    ],
    "DELETE /api/assignments/:id": [
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
        if (req.method === "OPTIONS") return next();
        if (!req.user?.role)
            return res.status(401).json({ message: "Не авторизован" });

        // Нормализация пути (заменяем `/123` на `/:id`)
        const normalizedPath = req.path.replace(/\/\d+(\/|$)/g, "/:id$1");
        const routeKey = `${req.method} ${req.baseUrl}${normalizedPath}`;

        const requiredRoles = roleRequirements[routeKey];
        const userRole = (req.user.role.name || req.user.role).toUpperCase();

        // Если маршрут не найден — запрещаем доступ (или разрешаем, зависит от логики)
        if (!requiredRoles) {
            return res
                .status(403)
                .json({ message: "Маршрут не настроен в системе прав" });
        }

        const hasAccess = requiredRoles
            .map((role) => role.toUpperCase())
            .includes(userRole);

        if (!hasAccess) {
            return res.status(403).json({ message: "Недостаточно прав" });
        }

        next();
    };
}
