const express = require('express')
const jwt = require('jsonwebtoken');
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

router.get('/create', authenticateToken, (req, res) => {
    //aca se crean los links con formulario para crear link
})

router.get('/edit', authenticateToken, (req, res) => {
    //aca se editan los links con formulario para editar links
})

module.exports = router