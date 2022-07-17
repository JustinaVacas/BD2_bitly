const express = require('express')
const jwt = require('jsonwebtoken');
const {Url} = require("../models/url");
const _ = require("lodash");
const router = express.Router()

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        console.log(err)
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

router.get('/', authenticateToken, (req, res) => {
    res.render('profile.ejs');
})

router.post('/create', authenticateToken, async (req, res) => {
    //aca se crean los links con formulario para crear link
    let url = await Url.findOne({ full: req.body.full });
    // short
    if (url) {
        return res.status(400).send('That url already exists!');
    } else {
        // Insert the new user if they do not exist yet
        url = new Url(_.pick(req.body, ['full', 'short', 'clicks', 'userId']));
        await url.save();
    }
    res.render('profile.ejs');
})

router.get('/edit', authenticateToken, (req, res) => {
    //aca se editan los links con formulario para editar links
})

module.exports = router