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
            if (!ROLES.includes(decoded.role)) {
                return res.status(403).json({ message: "Нет доступа" });
            }
            req.user = decoded;
            next();
        } catch (e) {
            res.status(401).json({ message: "Не авторизован" });
        }
    };
}