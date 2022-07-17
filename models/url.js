const shortId = require('shortid')
const Joi = require('joi');
const mongoose = require('mongoose');

const Url = mongoose.model('url', new mongoose.Schema(
    {
        full: {
            type: String,
            required: true
        },
        short: {
            type: String,
            required: true,
            default: shortId.generate
        },
        clicks: {
            type: Number,
            required: true,
            default: 0
        },
        userId:{
            type: String,
        }
    },
    { timestamps: true }
));

function validateUrl(url) {
    const schema = {
        full: Joi.string().required(),
        short: Joi.string().required(),
        clicks: Joi.number().required().default(0),
        userId: Joi.string().required(),
    };
    return Joi.validate(url, schema);
}

exports.Url = Url;
exports.validate = validateUrl;