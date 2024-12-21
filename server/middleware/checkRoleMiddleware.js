const jwt = require("jsonwebtoken");
const ROLES = require("../rolesConfing");

module.exports = function () {
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
        return next();
        }

        try {
            const token = req.headers.authorization.split(" ")[1]; // Bearer jkasdhgkajlsd
            if (!token) {
                return res.status(401).json({ message: "Не авторизован" });
            }
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            req.user = decoded;
            const userRole = req.user.role;
            // Log the decoded token for debugging
            console.log("Decoded token:", req.user);

            if (userRole !== ROLES.ADMIN && userRole !== ROLES.MODERATOR) {
                return res
                .status(403)
                .json({ message: "Нет доступа, недостаточно прав" });
            }

            next();
        } catch (e) {
        res
            .status(401)
            .json({ message: "Ошибка проверки токена, не авторизован" });
        }
    };
};
