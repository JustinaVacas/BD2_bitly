const express = require('express')
const jwt = require('jsonwebtoken');
const {Url} = require("../models/url");
const {User} = require("../models/user");
const _ = require("lodash");
const router = express.Router();
const redis = require('redis');

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

async function updateRedis(old_short, new_short){
    const client = redis.createClient({url: process.env.REDIS_URL});
    await client.connect();
    await client.get('url-' + old_short, function (err, result) {
        if (!err) {
            var new_full = result;
            client.del('url-' + old_short, function (err, reply) {
                if (reply === 1) {
                    client.set('url-' + new_short, new_full);
                } else {
                    console.log('Bad delete in Redis!');
                }
            });
        } else {
            console.log('Key not found');
        }
    });
    await client.get('counter-'+old_short, function(err, result) {
        if (!err) {
            var counter = result;
            client.del('counter-'+old_short, function(err, reply) {
                if (reply === 1) {
                    client.set('url-'+new_short, counter);
                }else {
                    console.log('Bad delete in Redis!');
                }
            });
        } else {
            console.log('Key not found');
        }
    });
}

async function deleteRedis(short){
    const client = redis.createClient({url: process.env.REDIS_URL});
    client.on("error", (error) => console.error("error"));
    await client.connect();
    let reply = await client.exists('url-'+short, async function(err, reply) {
        if (reply === 1) {
            return 1;
        }
    });
    if (reply === 1){
        await client.del('url-'+short, function (err, reply) {});
    }
    let result = await client.exists('counter-'+short, async function(err, reply) {
        if (reply === 1) {
            return 1;
        }
    });
    if(result === 1){
        await client.del('counter-'+short, function(err, reply) {});
    };
}

async function findClicks(short){
    const client = redis.createClient({url: process.env.REDIS_URL});
    client.on("error", (error) => console.error("error"));
    await client.connect();
    let counter = await client.get('counter-'+short, function(err, counter) {
        if (!err) {
            return counter;
        } else {
            return null;
        }
    });
    return counter;
}

router.get('/', authenticateToken, async (req, res) => {
    await Url.find({userId: req.user._id}, async function (err, urls) {
        let urlCountMap = {};
        for (const url in urls) {
            let count = await findClicks(urls[url].short);
            urlCountMap[urls[url].short] = count;
        }
        res.render('profile.ejs', {urlList: urls, countMap: urlCountMap});
    });
})

router.post('/', authenticateToken, async (req, res) => {
    let url = await Url.findOne({ full: req.body.full });
    if (url) {
        return res.status(400).send('That url already exists!');
    } else {
        // Insert the new user if they do not exist yet
        req.body.userId = req.user._id;
        url = new Url(_.pick(req.body, ['full', 'short', 'userId']));
        await url.save(() => {
            var client = redis.createClient({url: process.env.REDIS_URL});
            client.set('counter-'+url.short, 0, (err,reply) => {
                if (err) res.status(500).send('Error creating Redis counter instance');
            });
        });
    }
    res.redirect('/profile');
})

router.post('/edit/:short', authenticateToken, async (req, res) => {
    //aca se editan los links con formulario para editar 
    const url = await Url.findOneAndUpdate({ short: req.params.short }, { short: req.body.short });
    if (url != null) return res.status(409).send('Url with that name already exists, please choose another one.');
    await updateRedis(req.params.short, req.body.short);
    res.status(204).redirect('/profile');
})

router.get('/delete/:short', authenticateToken, async (req, res) => {
    const url = await Url.findOneAndDelete({ short: req.params.short });
    if (url == null) return res.sendStatus(404);
    await deleteRedis(req.params.short);
    res.status(204).redirect('/profile');
})


module.exports = router;