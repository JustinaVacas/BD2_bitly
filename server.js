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
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true
})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

// REDIS
const redis = require('redis');

const usersRouter = require('./routes/users');
const urls = require('./routes/urls');
const homeRouter = require('./routes/home');
const profileRouter = require('./routes/profile');

//to add custom header in all routes
app.all('*', usersRouter.addHeader);

app.use('/', homeRouter);
app.use('/', usersRouter);
app.use('/profile', profileRouter);

const {Url} = require('./models/url');

app.get('/mylink/:short', async (req,res) => {

  //Busqueda en caché de Redis
  const client = redis.createClient({url:  process.env.REDIS_UR});
  client.on("error", (error) => console.error("error"));
  await client.connect();
  console.log(req.params.short)
  await client.get('url-'+req.params.short,  (err, reply) =>{
    if (!err) {
      client.incr('counter-'+req.params.short);  // counter++
      return res.redirect(reply);
    }
  });
  //No está en caché, busco en MongoDB
  const url = await Url.findOne({ short: req.params.short });
  if (url == null) return res.sendStatus(404);
  //Agrego la url al caché de Redis
  await client.set( 'url-'+url.short, url.full, (err, reply) => {
    if (err) res.status(500).send('Error creating Redis url instance');
  });
  await client.incr('counter-'+url.short); // counter++
  res.redirect(url.full);
})


app.listen(process.env.PORT || 3000);