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
<<<<<<< HEAD

            if (req.user.role !== ROLES.ADMIN || req.user.role !== ROLES.MODERATOR) {
            return res.status(403).json({ message: "Нет доступа, недостаточно прав" });
=======
            const userRole = req.user.role;
             // Log the decoded token for debugging
             console.log("Decoded token:", req.user);
             
            if (userRole !== ROLES.ADMIN && userRole !== ROLES.MODERATOR) {
                return res.status(403).json({ message: "Нет доступа, недостаточно прав" });
>>>>>>> 5bdabd1a2c4421db7dc1aea43238390ee7b3142b
            }

            next();
        } catch (e) {
            res.status(401).json({ message: "Ошибка проверки токена, не авторизован" });
        }
    };
}