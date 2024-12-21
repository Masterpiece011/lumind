const ApiError = require("../error/ApiError");
const { Publications } = require("../models/models");

class PublicationController {
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

    async update(req, res) {
        const { publication_id, title, content, description } = req.body;
        try {
            const publication = await Publications.findOne({
                where: publication_id,
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

    async delete(req, res) {
        const { publication_id } = req.body;
        try {
            await Publications.destroy({
                where: { publication_id },
            });
        } catch (error) {
            console.log("Error delete publication", error);
            return ApiError.badRequest("Error delete publication");
        }
    }

    async getAll(req, res) {
        const { group_id } = req.body;
        try {
            const publications = await Publications.findAll({
                where: { group_id },
            });

            return res.json({ publications });
        } catch (error) {
            console.log("Error fetching publications", error);
            return ApiError.badRequest("Error fetching publications");
        }
    }

    async getOne(req, res) {
        const { id } = req.params;

        try {
            const publication = await Publications.findOne({
                where: { id },
            });

            if (!publication) {
                return res.status(404).json({
                    message: "Publication not found",
                });
            }

            return res.json(group);
        } catch (error) {
            console.log("Error fetching publication", error);
            return res.status(500).json({
                message: "Error fetching publication",
            });
        }
    }
}

module.exports = new PublicationController();
