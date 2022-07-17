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
    /*const { error } = validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }*/

    // Check if this link already exists
    let url = await Url.findOne({ full: req.body.full });
    // short
    if (url) {
        return res.status(400).send('That url already exists!');
    } else {
        // Insert the new user if they do not exist yet
        url = new Url(_.pick(req.body, ['full', 'short', 'clicks', 'userId']));
        await user.save();
    }
});

router.put('/:id', async (req, res) => {})

router.get('/:id', (req,res) => {})


module.exports = router;