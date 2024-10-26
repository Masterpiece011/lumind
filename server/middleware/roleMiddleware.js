const { Roles } = require('../models/models');
const ROLES = require('../rolesConfing');

const roleRequirements = {
    '/registration': ROLES.ADMIN,
    '/update': (ROLES.ADMIN, ROLES.INSTRUCTOR),
    '/delete': ROLES.ADMIN
};

module.exports = function () {
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
            return next();
        }

        // Log the incoming request path for debugging
        console.log("Incoming request path:", req.path);

        if (!req.user || !req.user.role) {
            console.log("User not found or role not specified:", req.user); // Log the user object for debugging
            return res.status(401).json({ message: "Не авторизован" });
        }

        const requiredRole = roleRequirements[req.path];
        console.log("Required Role:", requiredRole); 
        console.log("User Role:", req.user.role);

        if (requiredRole && req.user.role !== requiredRole) {
            return res.status(403).json({ message: "Нет доступа, недостаточно прав" });
        }

        next();
    };
};
