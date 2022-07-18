const shortId = require('shortid')
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
        userId:{
            type: String,
        }
    },
    { timestamps: true }
));

module.exports = Url;