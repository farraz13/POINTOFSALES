var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt')
const saltRounds = 10;

module.exports = (db) =>{
router.get('/', function(req, res, next) {
  res.render('unitsPage/list');
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

  const total = await db.query(`select count(*) as total from units${params.length > 0 ? ` where ${params.join(' or ')}` : ''}`)
  const data = await db.query(`select * from units${params.length > 0 ? ` where ${params.join(' or ')}` : ''} order by ${sortBy} ${sortMode} limit ${limit} offset ${offset} `)
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
router.get('/delete/:unit', function (req, res, next) {
  db.query('DELETE FROM units WHERE unit =$1', [Number(req.params.userid)], (err) => {
    if (err) return res.send(err, 'error bang')
    res.redirect('/units')
  });
});
//akhirDELETE

//EDIT
router.get('/edit/:unit', function (req, res, next) {
  db.query('SELECT * FROM units WHERE unit =$1', [req.params.userid], (err, data) => {
    if (err) return res.send(err, 'error bang')
    if (data.rows.length == 0) return res.send(err, 'data not found')
    res.render('unitsPage/edit', { item: data.rows[0] })
  })
});

router.post('/edit/:unit', function (req, res, next) {
  const {userid} = req.params
  const { email, name, role } = req.body
  db.query('UPDATE public.units SET email=$1, name=$2, role=$3 WHERE userid=$4 ', [email, name, role, userid], (err) => {
    if (err) {
      return res.send(err, 'error bang')
    }
    res.redirect('/units')
  })
})
//akhirEDIT

//ADD
router.get('/add', function (req, res, next) {
    res.render('unitsPage/add')

});

router.post('/add', async function (req, res, next) {
  try {
    console.log(req.body)
    const { name, email, password, role } = req.body

    const { rows: emails } = await db.query('SELECT * FROM units WHERE email = $1', [email])

    if (emails.length > 0) return res.send('email sudah ada')

    const hash = bcrypt.hashSync(password, saltRounds);
    await db.query('INSERT INTO units (email, name, password, role) VALUES ($1, $2, $3, $4)', [email, name, hash, role])

    res.redirect('/units')
  } catch (e) {
    console.log(e)
    res.redirect('/units')
  }
});
//akhirADD


return router;
};