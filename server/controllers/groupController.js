const { json } = require("sequelize");
const { Groups, Users } = require("../models/models");
const ApiError = require("../error/ApiError");

class GroupController {
    async create(req, res) {
        try {
            const { id, title, creator_id } = req.body;

            if (!title || !creator_id) {
                return res.status(400).json({
                    message: "Нельзя создать группу без названия или создателя",
                });
            }
            const group = await Groups.create({
                id: id,
                title: title,
                creator_id: creator_id,
            });

            return res.json(group);
        } catch (e) {
            return res.status(500).json({
                message: "Server error",
            });
        }
    }

    async getAll(req, res) {
        try {
            const groups = await Groups.findAll({
                include: [
                    {
                        model: Users,
                        attributes: ["id", "first_name", "middle_name", "last_name"],
                        through: {
                            attributes: [],
                        },
                    },
                ],
            });
            return res.json({ groups });
        } catch (error) {
            console.log("Error fetchgin groups ", error);
        }
    }

    async getOne(req, res) {
        try {
            const { id } = req.params;

            const group = await Groups.findOne({
                where: { id },
                include: [
                    {
                        model: Users,
                        attributes: ["id", "first_name", "middle_name", "last_name"],
                        through: {
                            attributes: [],
                        },
                    },
                ],
            });

            if (!group) {
                return res.status(404).json({
                    message: "Группа не найдена",
                });
            }

            return res.json(group);
        } catch (error) {
            console.log("Ошибка при получении группы:", error);
            return res.status(500).json({
                message: "Ошибка при получении группы",
            });
        }
    }
  

  async update(req, res) {
    const { id, title, users } = req.body; 
    try {
      const group = await Groups.findOne({ where: { id: id }, include: Users });
  
      if (group) {
        await group.update({ title: title });
  
        if (users) {
          const usersArray = Array.isArray(users) ? users : [users];
  
          await group.addUsers(usersArray);
  
          const updatedUsers = await group.getUsers();
  
          const userDetails = updatedUsers.map(user => ({
            id: user.id,
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
          }));
  
          return res.json({
            group: {
              id: group.id,
              title: group.title,
              users: userDetails, 
            },
          });
        }
  
        return res.json({
          group: {
            id: group.id,
            title: group.title,
            users: [], 
          },
        });
      } else {
        return ApiError.badRequest("Группа не найдена");
      }
    } catch (e) {
      console.error(e);
      return ApiError.badRequest("Невозможно обновить группу");
    }
}  

    async delete(req, res) {
        const { id } = req.body;

        try {
            await Groups.destroy({
                where: {
                    id: id,
                },
            });

            const group = Groups.findOne({
                where: {
                    id: id,
                },
            });

            if (group.user) {
                await Users_Groups.destroy({
                    where: {
                        user_id: id,
                    },
                });
            }

            return res.json({
                message: `Группа по id ${id} была удалена`,
            });
        } catch (e) {
            return ApiError.badRequest("Невозможно удалить группу");
        }
    }
}

module.exports = new GroupController();
