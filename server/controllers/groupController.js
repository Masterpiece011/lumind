const { json } = require("sequelize")
const {Groups, Users} = require('../models/models')
const ApiError = require("../error/ApiError")


class GroupController {
    async create(req, res) {
        try {
            const {id, title, creator_id} = req.body

            console.log("Название группы", title);
            console.log("Создатель группы", creator_id);

            if (!title || !creator_id) {
                return res.status(400).json({message: 'Нельзя создать группу без названия или создателя'})
            }
            const group = await Groups.create({
                id: id,
                title: title, 
                creator_id: creator_id
            })
            
            return res.json(group)
        } catch (e) {
            return res.status(500).json({message: 'Server error'})
        }
    }

    async getAll(req, res) {
        try {
            const groups = await Groups.findAll(
                {
                    include: [
                        {
                        model: Users,
                        attributes: ['id', 'first_name', 'middle_name', 'last_name'],
                        through: {attributes: []}
                        }
                    ]
                }
            )
            return res.json({groups})
        } catch (error) {
            console.log("Error fetchgin groups ", error);
        }
    }

    async getOne(req, res) {

    }

    async update(req, res) {
        const {id, title} = req.body
        try {
            const group = await Groups.findOne({where: {id: id}})
            if (group) {
                await group.update(
                    {
                    title: title
                    }
                )

                return res.json(group)
            } else {
                return ApiError.badRequest("Группа не найдена")
            }
        } catch (e) {
            return ApiError.badRequest("Невозможно обновить группу")
        }
    }

    async delete(req, res) {

    }
}


module.exports = new GroupController()