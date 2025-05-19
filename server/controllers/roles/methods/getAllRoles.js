import { Roles } from "../../../models/models.js";

import ApiError from "../../../error/ApiError.js";

export default async function getAllRoles(req, res, next) {
    try {
        const roles = await Roles.findAll();

        return res.json({ roles: roles });
    } catch (error) {
        console.log("Ошибка получения ролей", error);
        return ApiError.internal("Ошибка получения ролей");
    }
}
