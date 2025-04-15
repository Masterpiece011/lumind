import dotenv from "dotenv";
dotenv.config();

import ApiError from "../error/ApiError.js";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { Op } from "sequelize";

import { Users, Roles, Groups, Teams } from "../models/models.js";

import * as ROLES from "../rolesConfing.js";

const generateJwt = (id, email, role) => {
    console.log("Generating JWT for Role:", role);
    return jwt.sign({ id, email, role }, process.env.SECRET_KEY, {
        expiresIn: "24h",
    });
};

class UserController {
    // Регистрация пользователя (доступна только АДМИНАМ и МОДЕРАТОРАМ)

    async registration(req, res, next) {
        const { email, password, role, group_id, organization_id } = req.body;

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
            group_id: group_id,
            organization_id: organization_id,
        });

        const token = generateJwt(user.id, user.email, newUserRole);
        return res.json({ token });
    }

    // Авторизация пользователя

    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // 1. Находим пользователя
            const user = await Users.findOne({
                where: { email },
                include: [{ model: Roles, attributes: ["name"] }],
            });

            if (!user) {
                return next(ApiError.internal("Пользователь не найден"));
            }

            // 2. Проверяем пароль
            let passwordValid;
            if (
                user.password.startsWith("$2a$") ||
                user.password.startsWith("$2b$")
            ) {
                // Пароль уже зашифрован
                passwordValid = bcrypt.compareSync(password, user.password);
            } else {
                // Пароль в открытом виде - сравниваем напрямую
                passwordValid = password === user.password;

                // Если пароль верный, хэшируем и сохраняем
                if (passwordValid) {
                    const hashedPassword = bcrypt.hashSync(password, 5);
                    await Users.update(
                        { password: hashedPassword },
                        { where: { id: user.id } }
                    );
                }
            }

            if (!passwordValid) {
                return next(ApiError.internal("Неверный логин или пароль"));
            }

            // 3. Генерируем токен
            const token = generateJwt(user.id, user.email, user.role);

            // 4. Устанавливаем куки
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 24 * 60 * 60 * 1000,
            });

            return res.json({ success: true, token });
        } catch (error) {
            return next(
                ApiError.internal(`Ошибка авторизации: ${error.message}`)
            );
        }
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
            const {
                page = 1,
                quantity = 10,
                order = "ASC",
                search_text = "",
            } = req.body;

            // Рассчитываем смещение (offset)
            const offset = (page - 1) * quantity;

            // Формируем условия для поиска
            const where = {};
            if (search_text) {
                where[Op.or] = [
                    { first_name: { [Op.iLike]: `%${search_text}%` } },
                    { last_name: { [Op.iLike]: `%${search_text}%` } },
                    { email: { [Op.iLike]: `%${search_text}%` } },
                    { display_name: { [Op.iLike]: `%${search_text}%` } },
                ];
            }

            // Нормализация параметра сортировки
            const normalizeOrder = (orderParam) => {
                if (
                    orderParam.toUpperCase() === "ASC" ||
                    orderParam.toUpperCase() === "DESC"
                ) {
                    return [["display_name", orderParam]];
                }

                if (typeof orderParam === "string") {
                    const [field, direction] = orderParam.split(":");
                    return [[field || "display_name", direction || "ASC"]];
                }

                if (Array.isArray(orderParam) && orderParam.length === 2) {
                    return [orderParam];
                }

                return [["last_name", "ASC"]];
            };

            const sequelizeOrder = normalizeOrder(order);

            // Получаем общее количество пользователей
            const totalUsers = await Users.count({ where });

            // Получаем пользователей с пагинацией
            const users = await Users.findAll({
                where,
                include: [
                    {
                        model: Groups,
                        as: "group", // Должно соответствовать ассоциации в модели
                        attributes: ["id", "title"],
                    },
                    {
                        model: Roles,
                        as: "role", // Должно соответствовать ассоциации в модели
                        attributes: ["name"],
                    },
                    {
                        model: Teams,
                        as: "teams",
                        through: { attributes: [] },
                    },
                ],
                attributes: { exclude: ["password"] },
                limit: quantity,
                offset: offset,
                order: sequelizeOrder,
                subQuery: false,
            });

            // Формируем ответ
            const response = {
                data: users.map((user) => ({
                    id: user.id,
                    img: user.img,
                    first_name: user.first_name,
                    middle_name: user.middle_name,
                    last_name: user.last_name,
                    display_name: user.display_name,
                    email: user.email,
                    role: user.role.name, // Используем lowercase
                    group: user.group
                        ? {
                              // Используем lowercase
                              id: user.group.id,
                              title: user.group.title,
                          }
                        : null,
                    teams: user.teams,
                })),
                total: totalUsers,
            };

            return res.json(response);
        } catch (error) {
            console.error("Error fetching users:", error);
            return res.status(500).json({
                message: "Error fetching users",
                error: error.message,
            });
        }
    }

    // Получение одного пользователя по ID

    async getOne(req, res) {
        const { id } = req.params;

        try {
            const user = await Users.findOne({
                where: {
                    id: id,
                },
                include: [
                    {
                        model: Groups,
                        as: "group", // Должно соответствовать ассоциации в модели
                        attributes: ["id", "title", "creator_id"],
                    },
                    {
                        model: Roles,
                        as: "role", // Должно соответствовать ассоциации в модели
                        attributes: ["name"],
                    },
                    {
                        model: Teams,
                        as: "teams",
                        through: { attributes: [] },
                    },
                ],
                attributes: { exclude: ["password"] },
            });

            if (!user) {
                return res
                    .status(404)
                    .json({ message: "Пользователь не найден" });
            }

            const user_data = {
                id: user.id,
                img: user.img,
                first_name: user.first_name,
                middle_name: user.middle_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role.name,
                group: user.group,
                teams: user.teams,
            };

            return res.json({ user_data });
        } catch (error) {
            console.log("Не удалось найти пользователя", error);

            return ApiError.internal("Ошибка поиска");
        }
    }

    // Обновление пользователя

    async update(req, res) {
        try {
            const {
                user_id,
                first_name,
                middle_name,
                last_name,
                display_name,
                group_id,
                role_name,
                img_url,
            } = req.body;

            // Находим пользователя
            const user = await Users.findOne({
                where: { id: user_id },
                attributes: { exclude: ["password"] },
            });

            if (!user) {
                return ApiError.badRequest("Пользователь не найден");
            }

            // Находим роль, если она указана
            let roleId = user.role_id;
            if (role_name) {
                const role = await Roles.findOne({
                    where: { name: role_name },
                });
                if (!role) {
                    return ApiError.badRequest("Указанная роль не найдена");
                }
                roleId = role.id;
            }

            // Обновляем данные пользователя
            await user.update({
                first_name: first_name || user.first_name,
                middle_name: middle_name || user.middle_name,
                last_name: last_name || user.last_name,
                display_name: display_name || user.display_name,
                group_id: group_id || user.group_id,
                role_id: roleId, // Используем обновленный или старый role_id
                img: img_url || user.img,
            });

            // Формируем ответ
            return res.status(200).json({
                success: true,
                data: user,
                message: "Пользователь успешно обновлен",
            });
        } catch (error) {
            console.error("Ошибка при обновлении пользователя:", error);
            return ApiError.badRequest("Невозможно обновить пользователя");
        }
    }

    // Удаление пользователя

    async delete(req, res) {
        try {
            const { id } = req.params; // Лучше брать ID из параметров URL

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "ID пользователя обязательно",
                });
            }

            const user = await Users.findByPk(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Пользователь не найден",
                });
            }

            const userName = `${user.first_name} ${user.last_name}`;

            await user.destroy();

            return res.status(200).json({
                success: true,
                message: `Пользователь ${userName} успешно удалён`,
            });
        } catch (error) {
            console.error("Ошибка удаления пользователя:", error);

            return res.status(500).json({
                success: false,
                message: "Внутренняя ошибка сервера при удалении",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }
}
export default new UserController();
