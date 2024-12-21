const jwt = require('jsonwebtoken');
const ROLES = require('../rolesConfing')

module.exports = function () {
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
            return next();
        }
        
        try {
            const token = req.headers.authorization.split(' ')[1]; // Bearer jkasdhgkajlsd
            if (!token) {
            return res.status(401).json({ message: "Не авторизован" });
            }
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            req.user = decoded;

            if (req.user.role !== ROLES.ADMIN || req.user.role !== ROLES.MODERATOR) {
            return res.status(403).json({ message: "Нет доступа, недостаточно прав" });
            }

            next();
        } catch (e) {
            res.status(401).json({ message: "Ошибка проверки токена, не авторизован" });
        }
    };
}