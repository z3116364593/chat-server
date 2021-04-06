const mongoose = require('mongoose')

let everyoneSchema = new mongoose.Schema({
    name: { type: String, required: true }
})

let msgSchema = new mongoose.Schema({
    oneseif: { type: String, required: true },
    adverse: { type: String, required: true },
    msg: { type: String, required: true }
})

module.exports = {
    everyoneSchema,
    msgSchema
}