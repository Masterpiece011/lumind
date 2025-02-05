require("dotenv").config();

const ApiError = require("../error/ApiError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Users, Roles, Groups, Users_Groups } = require("../models/models");
const { Sequelize, model } = require("../db");
const ROLES = require("../rolesConfing");

const generateJwt = (id, email, role) => {
    console.log("Generating JWT for Role:", role);
    return jwt.sign({ id, email, role }, process.env.SECRET_KEY, {
        expiresIn: "24h",
    });
};

class UserController {
    // Регистрация пользователя (доступна только АДМИНАМ и МОДЕРАТОРАМ)

    async registration(req, res, next) {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return next(ApiError.badRequest("Некорректный email или password"));
        }
        const candidate = await Users.findOne({ where: { email: email } });
        if (candidate) {
            return next(
                ApiError.badRequest("Пользователь с таким email уже существует")
            );
        }
        const hashPassword = await bcrypt.hash(password, 5);

        const newUserRole = role || ROLES.USER;
        console.log("Requested Role:", newUserRole);

        const roleId = await Roles.findOne({ where: { name: newUserRole } });
        console.log("Found Role ID:", roleId);

        if (!roleId) {
            return next(ApiError.badRequest("Некорректная роль"));
        }

        const user = await Users.create({
            email,
            password: hashPassword,
            role_id: roleId.id,
        });

        const token = generateJwt(user.id, user.email, newUserRole);
        return res.json({ token });
    }

    // Авторизация пользователя

    async login(req, res, next) {
        const { email, password } = req.body;

        const user = await Users.findOne({
            where: {
                email: email,
            },
            include: [
                {
                    model: Roles,
                    attributes: ["name"],
                },
            ],
        });

        if (!user) {
            return next(ApiError.internal("Пользователь не найден"));
        }

        let comparePassword = await bcrypt.compareSync(password, user.password);

        if (!comparePassword) {
            return next(ApiError.internal("Указан неверный пароль"));
        }

        const token = generateJwt(user.id, user.email, user.role);

        return res.json({ token: token });
    }

    // Проверка формирования токена

    async check(req, res, next) {
        const userId = req.user.id;
        const userEmail = req.user.email;
        const userRole = req.user.role;
        const token = generateJwt(userId, userEmail, userRole);

        return res.json({
            token: token,
            user: {
                id: userId,
                email: userEmail,
                role: userRole,
            },
        });
    }

    // Получение всех пользователей

    async getAll(req, res) {
        try {
            // Получаем всех пользователей из базы данных

            const users = await Users.findAll({
                include: [
                    {
                        model: Groups,
                        attributes: ["id", "title"],
                        through: { attributes: [] },
                    },
                    {
                        model: Roles,
                        attributes: ["name"],
                    },
                ],
            });

            // Формируем ответ

            const response = users.map((user) => ({
                id: user.id,
                img: user.img,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                password: user.password,
                role: user.role,
                groups: user.groups,
            }));

            return res.json({ users: response });
        } catch (error) {
            console.error("Error fetching users:", error);

            return res.status(500).json({ message: "Error fetching users" });
        }
    }

    // Получение одного пользователя по ID

    async getOne(req, res) {
        const { user_id } = req.params;

        try {
            const token = req.headers.authorization.split(" ")[1];
            const user = await Users.findOne({
                where: {
                    id: user_id,
                },
                include: [
                    {
                        model: Groups,
                        attributes: ["id", "title", "creator_id"],
                        through: { attributes: [] },
                    },
                    {
                        model: Roles,
                        attributes: ["name"],
                    },
                ],
            });

            const user_data = {
                id: user.id,
                img: user.img,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                password: user.password,
                role: user.role,
                groups: user.groups,
            };

            return res.json({ user_data: user_data, user_token: token });
        } catch (error) {
            console.log("Не удалось найти пользователя", error);

            return ApiError.internal("Ошибка поиска");
        }
    }

    // Обновление пользователя

    async update(req, res) {
        const {
            user_id,
            first_name,
            middle_name,
            last_name,
            password,
            group_id,
            role_name,
        } = req.body;

        try {
            const user = await Users.findOne({
                where: { id: user_id },
                include: [
                    {
                        model: Roles,
                        attributes: ["name"],
                    },
                    {
                        model: Groups,
                        attributes: ["id", "title"],
                        through: { attributes: [] },
                    },
                ],
            });

            if (user) {
                const hashPassword = await bcrypt.hash(password, 5);

                await user.update({
                    first_name: first_name,
                    middle_name: middle_name,
                    last_name: last_name,
                    password: hashPassword,
                    role: role_name,
                });

                if (group_id) {
                    await user.setGroups([group_id]);
                }

                const updatedUser = await Users.findOne({
                    where: { id: user_id },
                    include: [
                        {
                            model: Groups,
                            attributes: ["id", "title", "creator_id"],
                            through: { attributes: [] },
                        },
                        {
                            model: Roles,
                            attributes: ["name"],
                        },
                    ],
                });

                const user_data = {
                    id: updatedUser.id,
                    img: updatedUser.img,
                    first_name: updatedUser.first_name,
                    last_name: updatedUser.last_name,
                    email: updatedUser.email,
                    password: updatedUser.password,
                    role: updatedUser.role,
                    groups: updatedUser.groups,
                };

                return res.json({ user: user_data });
            } else {
                return ApiError.badRequest("Пользователь не найден");
            }
        } catch (error) {
            console.log("Невозможно получить данные пользователя", error);

            return ApiError.badRequest("Невозможно обновить пользователя");
        }
    }

    async delete(req, res) {
        const { user_id } = req.body;

        try {
            const user = await Users.findOne({
                where: {
                    id: user_id,
                },
            });

            const userName = `${user.first_name} ${user.last_name}`;

            await Users.destroy({
                where: {
                    id: user_id,
                },
            });

            if (user.groups) {
                await Users_Groups.destroy({
                    where: {
                        user_id: user_id,
                    },
                });
            }

            return res.json({
                message: `Пользователь ${userName} был удален`,
            });
        } catch (error) {
            console.log("Невозможно удалить пользователя", error);

            return ApiError.badRequest("Невозможно удалить пользователя");
        }
    }
}
module.exports = new UserController();
