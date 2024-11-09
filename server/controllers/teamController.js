require("dotenv").config();
const {
  Users,
  Groups,
  Users_Groups,
  Teams,
  Users_Teams,
} = require("../models/models");
const { Sequelize, model } = require("../db");
const ApiError = require("../error/ApiError");

class TeamController {
  async create(req, res, next) {
    try {
      const { name, description, creator_id, group_id, user_id } = req.body;

      if (!name || !creator_id) {
        return next(
          ApiError.badRequest("Необходимо указать название команды и создателя")
        );
      }

      // Проверяем наличие пользователя-создателя
      const creator = await Users.findByPk(creator_id);
      if (!creator) {
        return next(ApiError.badRequest("Создатель с указанным ID не найден"));
      }

      // Создаем команду
      const team = await Teams.create({
        name,
        description,
        creator_id: creator_id,
      });

      // Добавляем пользователей в команду, если они указаны
      if (user_id && user_id.length) {
        const teamUsersData = user_id.map((userId) => ({
          team_id: team.id,
          user_id: userId,
        }));
        await Users_Teams.bulkCreate(teamUsersData);
      }

      // Добавляем всех пользователей из указанной группы в команду, если группа указана
      if (group_id) {
        const groupUsers = await Users_Groups.findAll({
          where: { group_id: group_id },
        });
        if (groupUsers.length) {
          const teamGroupUsersData = groupUsers.map((groupUser) => ({
            team_id: team.id,
            user_id: groupUser.user_id,
          }));
          await Users_Teams.bulkCreate(teamGroupUsersData);
        }
      }

      return res.json(team);
    } catch (error) {
      next(ApiError.internal("Ошибка при создании команды: " + error.message));
    }
  }

  // Получение команды по ID
  // Получение одной команды по ID с пользователями и группами
  async getOne(req, res, next) {
    try {
      const { id } = req.params;

      const team = await Teams.findByPk(id, {
        include: [
          {
            model: Users,
            through: { attributes: [] }, // убирает лишние поля из промежуточной таблицы
            attributes: ["id", "name"], // подставьте реальные атрибуты из модели Users
          },
          {
            model: Groups,
            through: { attributes: [] },
            attributes: ["id", "name"], // подставьте реальные атрибуты из модели Groups
          },
        ],
      });

      if (!team) {
        return next(ApiError.notFound("Команда с указанным ID не найдена"));
      }

      return res.json(team);
    } catch (error) {
      next(ApiError.internal("Ошибка при получении команды: " + error.message));
    }
  }

  // Получение всех команд с пользователями и группами
  async getAll(req, res, next) {
    try {
      const teams = await Teams.findAll({
        include: [
          {
            model: Users,
            through: { attributes: [] },
            attributes: ["id", "name"],
          },
          {
            model: Groups,
            through: { attributes: [] },
            attributes: ["id", "name"],
          },
        ],
      });

      return res.json(teams);
    } catch (error) {
      next(
        ApiError.internal("Ошибка при получении всех команд: " + error.message)
      );
    }
  }

  // Удаление команды
  async delete(req, res, next) {
    try {
      const { id } = req.body;
      const team = await Teams.findByPk(id);
      if (!team) {
        return next(ApiError.notFound("Команда с указанным ID не найдена"));
      }
      await team.destroy();
      return res.json({ message: "Команда успешно удалена" });
    } catch (error) {
      next(ApiError.internal("Ошибка удаления команды: " + error.message));
    }
  }

  // Обновление данных команды
  async update(req, res, next) {
    try {
      const { id, name, description } = req.body;
      const team = await Teams.findByPk(id);
      if (!team) {
        return next(ApiError.notFound("Команда с указанным ID не найдена"));
      }
      if (name) team.name = name;
      if (description) team.description = description;
      await team.save();
      return res.json(team);
    } catch (error) {
      next(ApiError.internal("Ошибка обновления команды: " + error.message));
    }
  }
}

module.exports = new TeamController();
