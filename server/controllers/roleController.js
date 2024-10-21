const { json } = require("sequelize")
const {Roles} = require('../models/models')

class RoleController {
    async create(req, res) {
        try {
            const {name} = req.body

            if (!name) {
                return res.status(400).json({message: 'Error creating role'})
            }
            const role = await Roles.create({name})
            return res.json(role)
        } catch (error) {
            return res.status(500).json({message: 'Server error'})
        }
    }

    async update(req, res) {
        
    }

    async getAll(req, res) {
        try {
            const roles = await Roles.findAll()
            return res.json(roles)
        } catch (error) {
            console.log("Error fetching roles", error);
        }
    }

    async delete(req, res) {
    
    }
}

module.exports = new RoleController()
