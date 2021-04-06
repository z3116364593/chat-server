const mongoose = require('mongoose')

let registerSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    headPortrait: { type: String, required: true },
    socketId: { type: String },
    sex: { type: String, required: true },
    birthday: { type: String, required: true },
    personalizedSignature: { type: String, default: '' }
})

module.exports = registerSchema
