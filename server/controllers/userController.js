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
  async registration(req, res, next) {
    if (!req.user || req.user.role !== ROLES.ADMIN) {
      return next(
        ApiError.forbidden(
          "Только администратор может регистрировать пользователей"
        )
      );
    }

    const { email, password, role } = req.body;

    if (!email || !password) {
      return next(ApiError.badRequest("Некорректный email или password"));
    }
    const candidate = await Users.findOne({ where: { email } });
    if (candidate) {
      return next(
        ApiError.badRequest("Пользователь с таким email уже существует")
      );
    }
    const hashPassword = await bcrypt.hash(password, 5);

    // Получаем ID роли. Если роль не указана, используем ID роли по умолчанию (например, USER).
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
      role_id: roleId.id, // Привязываем ID роли к новому пользователю
    });

    const token = generateJwt(user.id, user.email, newUserRole);
    return res.json({ token });
  }

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

    return res.json({ token });
  }

  async check(req, res, next) {
    const token = generateJwt(req.user.id, req.user.email, req.user.role);

    return res.json({
      token,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
    });
  }

  async getAll(req, res) {
    try {
      const token = req.headers.authorization.split(" ")[1];

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

      // Возвращаем пользователей с токеном
      return res.json({ users: response, user_token: token });
    } catch (error) {
      console.error("Error fetching users:", error); // Логируем ошибку для отладки
      return res.status(500).json({ message: "Error fetching users" });
    }
  }

  async getOne(req, res) {
    const { id } = req.params;

    try {
      const token = req.headers.authorization.split(" ")[1];
      const user = await Users.findOne({
        where: {
          id: id,
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
    } catch (e) {
      return ApiError.internal("Ошибка поиска");
    }
  }

  async update(req, res) {
    const {
      id,
      first_name,
      middle_name,
      last_name,
      password,
      group_id,
      role_name
    } = req.body;

    try {
      const user = await Users.findOne({
        where: { id: id },
        include: [
          {
            model: Roles,
            attributes: ["name"],
          },
          {
            model: Groups,
            attributes: ["id", "title"],
            through: { attributes: [] }
        }
        ],
      });

      if (user) {
        const hashPassword = await bcrypt.hash(password, 5);
        await user.update({
          first_name: first_name,
          middle_name: middle_name,
          last_name: last_name,
          password: hashPassword,
          role: role_name
        });

        if (group_id) {
          await user.setGroups([group_id]);
      }

       const updatedUser = await Users.findOne({
        where: { id },
        include: [
            {
                model: Groups,
                attributes: ["id", "title", "creator_id"],
                through: { attributes: [] }
            },
            {
                model: Roles,
                attributes: ["name"]
            }
        ]
    });

         const user_data = {
          id: updatedUser.id,
          img: updatedUser.img,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          email: updatedUser.email,
          password: updatedUser.password,
          role: updatedUser.role,
          groups: updatedUser.groups
      };

        return res.json({ user: user_data });
      } else {
        return ApiError.badRequest("Пользователь не найден");
      }
    } catch (e) {
      return ApiError.badRequest("Невозможно обновить пользователя");
    }
  }

  async delete(req, res) {

    const { id } = req.body;

    try {
      await Users.destroy({
        where: {
          id: id,
        },
      });

      const user = Users.findOne({
        where: {
          id: id,
        },
      });

      if (user.groups) {
        await Users_Groups.destroy({
          where: {
            user_id: id,
          },
        });
      }

      return res.json({ message: `Пользователь по id ${id} был удален` });
    } catch (e) {
      return ApiError.badRequest("Невозможно удалить пользователя");
    }
  }
}

module.exports = new UserController();
