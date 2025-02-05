const { json } = require("sequelize");
const { Groups } = require("../models/models");

class UsersGroupsController {
    // Создание связи группы с пользователями

    async create(req, res) {
        try {
            const { id, title, creator_id } = req.body;

            console.log("Название группы", title);
            console.log("Создатель группы", creator_id);

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
            return res.status(500).json({ message: "Server error" });
        }
    }

    // Обновление связи группы с пользователями

    async update(req, res) {}

    // Удаление связи группы с пользователями

    async delete(req, res) {}

    // Получение всех связей групп с пользователями

    async getAll(req, res) {
        try {
            const groups = await Groups.findAll();
            return res.json({ groups });
        } catch (error) {
            console.log("Error fetchgin groups ", error);
        }
    }

    async getOne(req, res) {}
}

module.exports = new UsersGroupsController();
