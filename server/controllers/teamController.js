require("dotenv").config();
const {
  Users,
  Groups,
  Users_Groups,
  Teams,
  Users_Teams,
  Groups_Teams,
} = require("../models/models");
const ApiError = require("../error/ApiError");

class TeamController {
  // Создание команды с учетом таблицы Groups_Teams
  async create(req, res, next) {
    try {
      const { name, description, creator_id, group_ids, user_ids } = req.body;

      if (!name || !creator_id) {
        return next(
          ApiError.badRequest("Необходимо указать название команды и создателя")
        );
      }

      // Проверка существования пользователя-создателя
      const creator = await Users.findByPk(creator_id);
      if (!creator) {
        return next(ApiError.badRequest("Создатель с указанным ID не найден"));
      }

      // Создаем команду
      const team = await Teams.create({
        name,
        description,
        creator_id,
      });

      // Если есть указанные пользователи, добавляем их в команду
      if (user_ids && user_ids.length) {
        const teamUsersData = user_ids.map((userId) => ({
          team_id: team.id,
          user_id: userId,
        }));
        await Users_Teams.bulkCreate(teamUsersData);
      }

      // Если есть указанные группы, добавляем их в таблицу Groups_Teams
      if (group_ids && group_ids.length) {
        const groupTeamsData = group_ids.map((groupId) => ({
          group_id: groupId,
          team_id: team.id,
        }));
        await Groups_Teams.bulkCreate(groupTeamsData);

        // Добавляем всех пользователей из указанных групп в команду
        const groupUsers = await Users_Groups.findAll({
          where: { group_id: group_ids },
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

  // Получение одной команды с пользователями и группами
  async getOne(req, res, next) {
    try {
      const { id } = req.params;

      const team = await Teams.findByPk(id, {
        include: [
          {
            model: Groups,
            through: { model: Groups_Teams, attributes: [] },
            attributes: ["id", "title"],
            include: [
              {
                model: Users,
                through: { attributes: [] },
                attributes: ["id", "first_name", "middle_name", "last_name"],
              },
            ],
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
            model: Groups,
            through: { model: Groups_Teams, attributes: [] },
            attributes: ["id", "title"],
            include: [
              {
                model: Users,
                through: { attributes: [] },
                attributes: ["id", "first_name", "middle_name", "last_name"],
              },
            ],
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
