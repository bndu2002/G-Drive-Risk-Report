let mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema(
    {
        user : String,
        refresh_token: String,
    }
    , { timestamps: true })

module.exports = mongoose.model('token', tokenSchema)