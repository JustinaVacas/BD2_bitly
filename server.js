if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express');
const config = require('config');
const expressLayouts = require('express-ejs-layouts');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express()

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, { 
  useUnifiedTopology: true,
  useNewUrlParser: true
})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

const auth = require('./routes/auth');
const users = require('./routes/users');
const homeRouter = require('./routes/home');
const profileRouter = require('./routes/profile');

app.use('/', homeRouter);
app.use('/profile', profileRouter);
app.use('/api/auth', auth);
app.use('/api/users', users);


app.listen(process.env.PORT || 3000);