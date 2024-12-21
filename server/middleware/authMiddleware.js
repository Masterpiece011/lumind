require('dotenv').config()

const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        const authHeader = req.headers.authorization

        if (!authHeader) {
        return res.status(401).json({ message: "Токен отсутствует, не авторизован" })
        }
        const token = authHeader.split(' ')[1] // Bearer jkasdhgkajlsd
        if (!token) {
        return res.status(401).json({message: "Не авторизован, токен не предоставлен"})
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        req.user = decoded
        next()
    } catch (e) {
        res.status(401).json({messasge: "Не авторизован, ошибка проверки токена"})
    }
}
