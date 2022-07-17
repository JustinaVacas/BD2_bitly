const _ = require('lodash');
const { Url, validate } = require('../models/url');
const express = require('express');
const router = express.Router();

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

router.post('/', authenticateToken, async (req, res) => {
    // First Validate The Request
    const { error } = validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    // Check if this link already exisits
    let url = await Url.findOne({ full: req.body.full });
    // short
    if (user) {
        return res.status(400).send('That user already exisits!');
    } else {
        // Insert the new user if they do not exist yet
        url = new Url(_.pick(req.body, ['full', 'short', 'password']));
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();
        const token = jwt.sign({ _id: user._id }, config.get('PrivateKey'));
        res.status(201).header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
    }
});

router.put('/:id', async (req, res) => {})

router.get('/:id', (req,res) => {})


module.exports = router;