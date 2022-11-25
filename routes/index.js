var express = require('express');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var router = express.Router();

const {isLoggedIn} = require('../helpers/util')

module.exports = (db) => {
  router.get('/', function (req, res, next) {
    res.render('login')
  });
  //LOGIN
  router.post('/login', async function (req, res, next) {
    try {
      const { email, password } = req.body
      console.log(email, password)
      const { rows: emails } = await db.query('SELECT * FROM users WHERE email = $1', [email])
      //res.json(emails)

      if (emails.length == 0) return res.send('email tidak terdaftar')
      console.log(password, emails[0].password, !bcrypt.compareSync(password, emails[0].password))
      if (!bcrypt.compareSync(password, emails[0].password)) {
        console.log('password beda')
        return res.send('password salah')
      }

      const user = emails[0]
      delete user['password']
      req.session.user = user
      res.redirect('/dashboard')
    } catch (e) {
      console.log(e)
    }
  });

  //LOGOUT
  router.get('/logout', isLoggedIn, function(req,res,next){
    req.session.destroy(function (err){
      res.redirect('/')
    })
  })

  //REGISTER
  router.get('/register', function (req, res, next) {
    res.render('register')
  });
  router.post('/register', async function (req, res, next) {
    try {
      const { name, email, password, role } = req.body
      console.log(email, name, password)
      const { rows: emails } = await db.query('SELECT * FROM users WHERE email = $1', [email])
      //res.json(emails)

      if (emails.length > 0) return res.send('email sudah ada')

      const hash = bcrypt.hashSync(password, saltRounds);
      await db.query('INSERT INTO users (email, name, password, role) VALUES ($1, $2, $3, $4)', [email, name, hash, role])

      res.redirect('/')
    } catch (e) {
      console.log(e)
    }
  });
  //DASHBOARD
  router.get('/dashboard',isLoggedIn, function (req, res, next) {
    res.render('dashboard', { user: req.session.user })
  });

  return router;
}
