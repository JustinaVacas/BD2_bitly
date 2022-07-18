const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User} = require('../models/user');
const express = require('express');

const router = express.Router();
var token;

router.get('/login', (req, res) => {
    res.render('login.ejs');
})

router.post('/login', async (req, res) => {
    //  Find the user by their email address
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).send('Incorrect email or password.');
    }

    // Then validate the Credentials in MongoDB match
    // those provided in the request
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        return res.status(400).send('Incorrect email or password.');
    }
    const accesToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET);
    token=accessToken;
    res.redirect('profile');
});

router.get('/register', (req, res) => {
    res.render('register.ejs');
})

router.post('/register', async (req, res) => {
    // Check if this user already exisits
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).send('That user already exisits!');
    } else {
        // Insert the new user if they do not exist yet
        user = new User(_.pick(req.body, ['name', 'email', 'password']));
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();
        const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET);
        token = accessToken
        res.redirect('profile');
    }
});

module.exports = router;
exports.addHeader = (req, res, next) => {
    if (!token) {
        console.log('token: undefined');
    } else {
        req.headers.authorization = 'Bearer ' + token; 
    }
    next();
}