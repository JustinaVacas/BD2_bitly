const mongoose = require('mongoose');

const User = mongoose.model('user', new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minlength: 4,
            maxlength: 50,
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
    },
    { timestamps: true }
));

module.exports = User;