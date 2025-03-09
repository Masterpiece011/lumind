import ApiError from "../error/ApiError.js";

import { Publications } from "../models/models.js";

class PublicationController {
    // Создание публикации

    async create(req, res) {
        const { title, content, description, creator_id } = req.body;
        try {
            await Publications.create({
                title: title,
                content: content,
                description: description,
                creator_id: creator_id,
            });

            return res.json({ message: "Publication successfuly created" });
        } catch (error) {
            console.log("Error creating publication", error);
            return ApiError.badRequest("Error creating publication");
        }
    }

    // Обновление публикации

    async update(req, res) {
        const { publication_id, title, content, description } = req.body;
        try {
            const publication = await Publications.findOne({
                where: { id: publication_id },
            });
            if (publication) {
                await publication.update({
                    title: title,
                    content: content,
                    description: description,
                });
            }
            return res.json({ message: "Publication successfuly updated" });
        } catch (error) {
            return ApiError.badRequest("Not available to update publication");
        }
    }

    // Удаление публикации

    async delete(req, res) {
        const { publication_id } = req.body;
        try {
            await Publications.destroy({
                where: { publication_id },
            });

            return res.json({ message: "Публикация успешно удалена" });
        } catch (error) {
            console.log("Ошибка удаления публикации:", error);
            return ApiError.badRequest("Ошибка удаления публикации");
        }
    }

    // Получение всех публикаций группы

    async getAll(req, res) {
        const { group_id } = req.body;
        try {
            const publications = await Publications.findAll({
                where: { group_id: group_id },
            });

            return res.json({ publications: publications });
        } catch (error) {
            console.log("Ошибка получения публикаций", error);
            return ApiError.badRequest("Ошибка получения публикаций");
        }
    }

    // Получение одной публикации по ID

    async getOne(req, res) {
        const { publication_id } = req.params;

        try {
            const publication = await Publications.findOne({
                where: { id: publication_id },
            });

            if (!publication) {
                return res.status(404).json({
                    message: "Публикация не найдена",
                });
            }

            return res.json(group);
        } catch (error) {
            console.log("Ошибка получения публикации", error);
            return res.status(500).json({
                message: "Ошибка получения публикации",
            });
        }
    }
}

export default new PublicationController();
