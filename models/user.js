const Joi = require('joi');
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
/*
function validateUser(user) {
    const schema = {
        name: Joi.string().min(4).max(50).required(),
        email: Joi.string().required().email(),
        password: Joi.string().min(6).required()
    };
    return Joi.validate(user, schema);
}*/

module.exports.User = User;
//module.exports.validate = validateUser;