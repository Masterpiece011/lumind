require('dotenv').config()

const jwt = require('jsonwebtoken')
const USER_ROLES = require('../rolesConfing')

module.exports = function (role) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        const token = req.headers.authorization.split(' ')[1] // Bearer jkasdhgkajlsd
        if (!token) {
            return res.status(401).json({message: "Не авторизован"})
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        if (decoded.role !== role) {
            console.log(USER_ROLES);
            
            return res.status(403).json({message: "Нет доступа"})
        }
        req.user = decoded
        next()
    } catch (e) {
        res.status(401).json({messasge: "Не авторизован"})
    }
}
