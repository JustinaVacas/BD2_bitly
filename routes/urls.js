const _ = require('lodash');
const {Url} = require('../models/url');
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
    // Check if this link already exists
    let url = await Url.findOne({ full: req.body.full });
    // short
    if (url) {
        return res.status(400).send('That url already exists!');
    } else {
        // Insert the new user if they do not exist yet
        url = new Url(_.pick(req.body, ['full', 'short', 'userId']));
        await url.save(() => {
            var client = redis.createClient({url: process.env.REDIS_URL});
            client.set(['counter-'+url.short, 0],(err,reply) => {
                if (err) res.status(500).send('Error creating Redis counter instance');
            });
        });
    }
    res.status(201).send(_.pick(url, ['_id', 'full', 'short', 'userId']));
});

router.put('/:short', async (req, res) => {
    const url = await Url.findOneAndUpdate({ short: req.params.short }, { short: req.body.short });
    if (url != null) return res.status(409).send('Url with that name already exists, please choose another one.');
    //borrar el caché de redis (hacer un find and delete)
})

router.delete('/:short', async (req, res) => {
    const url = await Url.findOneAndDelete({ short: req.params.short });
    //borrar el caché de redis (hacer un find and delete)
    if (url == null) return res.sendStatus(404);
    res.sendStatus(204);
})

module.exports = router;