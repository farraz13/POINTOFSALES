var express = require('express');
const {isLoggedIn, isAdmin} = require('../helpers/util')
const bcrypt = require('bcrypt')

var router = express.Router();

const saltRounds = 10;


module.exports = (db) =>{
router.get('/',isAdmin , function(req, res, next) {
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
router.get('/delete/:userid', isAdmin , function (req, res, next) {
  db.query('DELETE FROM users WHERE userid =$1', [Number(req.params.userid)], (err) => {
    if (err) return res.send(err, 'error bang')
    res.redirect('/users')
  });
});
//akhirDELETE

//EDIT
router.get('/edit/:userid',  isAdmin , function (req, res, next) {
  db.query('SELECT * FROM users WHERE userid =$1', [req.params.userid], (err, data) => {
    if (err) return res.send(err, 'error bang')
    if (data.rows.length == 0) return res.send(err, 'data not found')
    res.render('usersPage/edit', { item: data.rows[0] })
  })
});

router.post('/edit/:userid',  isAdmin , function (req, res, next) {
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
router.get('/add',  isAdmin , function (req, res, next) {
    res.render('usersPage/add',{user:req.session.user})

});

router.post('/add',  isAdmin , async function (req, res, next) {
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

router.get('/profile',  isLoggedIn , function (req, res, next) {
  try {
    res.render('usersPage/profile', { success: req.flash('success'), error: req.flash('error'),user: req.session.user })
    
  } catch (error) {
    res.send(err)
  }
  // db.query('SELECT * FROM users WHERE userid =$1', [req.params.userid], (err, data) => {
  //   if (err) return res.send(err, 'error bang')
  //   if (data.rows.length == 0) return res.send(err, 'data not found')
  // })
});

router.post('/profile', isLoggedIn, async (req, res) => {
  try {
    const user = req.session.user
    const userid = user.userid
    const { email, name } = req.body

    await db.query('UPDATE users SET email = $1, name = $2 WHERE userid = $3 returning *',[email, name, userid])

    const { rows: emails } = await db.query(`SELECT * FROM users WHERE email = $1`,[email])
    const data = emails[0]
    req.session.user = data
    req.session.save()
    req.flash('success', 'Your profile has been updated')
    res.redirect('/users/profile')
  } catch (err) {
    console.log(err);
    req.flash('error', 'Can not updated profile')
    return res.redirect('/users/profile')
  }
})

router.get('/changepass', isLoggedIn, async  (req, res, next) => {
  try {
    res.render('usersPage/changePass', {
      success: req.flash('success'),
      error: req.flash('error'),
      user: req.session.user,
    })
  } catch (e) {
    res.send(e);
  }
});

router.post('/changepass', isLoggedIn, async  (req, res, next) => {
  try {
    const user = req.session.user
    const userid = user.userid
    const { oldpassword, newpassword, repassword } = req.body
    const { rows } = await db.query(`SELECT * FROM users WHERE userid = $1`, [userid])

    if (newpassword != repassword)  throw "Retype Password, New password doesn't match"
    if (!bcrypt.compareSync(oldpassword, rows[0].password)) throw `Your Old password is wrong`

    const hash = bcrypt.hashSync(newpassword, saltRounds)
    const { s } = await db.query('UPDATE users set password = $1 WHERE userid = $2', [hash, userid])
    req.flash('success', 'Your password has been updated')
    res.redirect('/users/changepass')
  } catch (err) {
    req.flash('error', err)
    return res.redirect('/users/changepassword')
  }
});

return router;
};