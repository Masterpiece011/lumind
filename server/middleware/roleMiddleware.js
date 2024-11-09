const { Roles } = require("../models/models");
const ROLES = require("../rolesConfing");

const roleRequirements = {
  "/registration": ROLES.ADMIN,
  "PUT /api/users/": [ROLES.ADMIN, ROLES.INSTRUCTOR],
  "DELETE /api/users/": ROLES.ADMIN,
  "POST /api/groups/": ROLES.ADMIN,
  "PUT /api/groups/": [ROLES.ADMIN, ROLES.MODERATOR],
  "DELETE /api/groups/": ROLES.ADMIN,
  "POST /api/teams/": [ROLES.ADMIN, ROLES.MODERATOR, ROLES.INSTRUCTOR],
};

module.exports = function () {
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

    const userRole = req.user.role.name || req.user.role;

    const isAuthorized = Array.isArray(requiredRole)
      ? requiredRole.includes(userRole)
      : userRole === requiredRole;

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Нет доступа, недостаточно прав" });
    }

    next();
  };
};
