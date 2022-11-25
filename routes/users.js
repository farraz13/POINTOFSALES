var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt')
const saltRounds = 10;

const {isLoggedIn} = require('../helpers/util')

module.exports = (db) =>{
router.get('/', function(req, res, next) {
  res.render('usersPage/list', {user: req.session.user});
});

//DATATABLE
router.get('/datatable', async (req, res) => {
  let params = []

  if(req.query.search.value){
      params.push(`name ilike '%${req.query.search.value}%'`)
  }
  if(req.query.search.value){
    params.push(`email ilike '%${req.query.search.value}%'`)
}

  const limit = req.query.length
  const offset = req.query.start
  const sortBy = req.query.columns[req.query.order[0].column].data
  const sortMode = req.query.order[0].dir

  const total = await db.query(`select count(*) as total from users${params.length > 0 ? ` where ${params.join(' or ')}` : ''}`)
  const data = await db.query(`select * from users${params.length > 0 ? ` where ${params.join(' or ')}` : ''} order by ${sortBy} ${sortMode} limit ${limit} offset ${offset} `)
  const response = {
      "draw": Number(req.query.draw),
      "recordsTotal": total.rows[0].total,
      "recordsFiltered": total.rows[0].total,
      "data": data.rows
    }
  res.json(response)
})
//akhirDATATABLE

//DELETE
router.get('/delete/:userid', isLoggedIn , function (req, res, next) {
  db.query('DELETE FROM users WHERE userid =$1', [Number(req.params.userid)], (err) => {
    if (err) return res.send(err, 'error bang')
    res.redirect('/users')
  });
});
//akhirDELETE

//EDIT
router.get('/edit/:userid',  isLoggedIn , function (req, res, next) {
  db.query('SELECT * FROM users WHERE userid =$1', [req.params.userid], (err, data) => {
    if (err) return res.send(err, 'error bang')
    if (data.rows.length == 0) return res.send(err, 'data not found')
    res.render('usersPage/edit', { item: data.rows[0] })
  })
});

router.post('/edit/:userid',  isLoggedIn , function (req, res, next) {
  const {userid} = req.params
  const { email, name, role } = req.body
  db.query('UPDATE public.users SET email=$1, name=$2, role=$3 WHERE userid=$4 ', [email, name, role, userid], (err) => {
    if (err) {
      return res.send(err, 'error bang')
    }
    res.redirect('/users')
  })
})
//akhirEDIT

//ADD
router.get('/add',  isLoggedIn , function (req, res, next) {
    res.render('usersPage/add')

});

router.post('/add',  isLoggedIn , async function (req, res, next) {
  try {
    console.log(req.body)
    const { name, email, password, role } = req.body

    const { rows: emails } = await db.query('SELECT * FROM users WHERE email = $1', [email])

    if (emails.length > 0) return res.send('email sudah ada')

    const hash = bcrypt.hashSync(password, saltRounds);
    await db.query('INSERT INTO users (email, name, password, role) VALUES ($1, $2, $3, $4)', [email, name, hash, role])

    res.redirect('/users')
  } catch (e) {
    console.log(e)
    res.redirect('/users')
  }
});
//akhirADD


return router;
};