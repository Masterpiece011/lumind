require("dotenv").config();

// authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  console.log("Auth Middleware Triggered"); // Логирование для отладки
  console.log("Request Headers:", req.headers); // Логирование всех заголовков
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1]; // Bearer token
    if (!token) {
      console.log("No token found");
      return res.status(401).json({ message: "Не авторизован" });
    }
<<<<<<< HEAD
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
=======
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; // Добавляем информацию о пользователе
    console.log("Decoded User:", req.user); // Логирование для отладки
    next();
  } catch (e) {
    return res.status(401).json({ message: "Не авторизован" });
  }
};
>>>>>>> 5bdabd1a2c4421db7dc1aea43238390ee7b3142b
