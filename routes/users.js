var express = require('express');
var router = express.Router();


module.exports = (db) =>{
router.get('/', function(req, res, next) {
  res.render('usersPage/list');
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

//DELETE
router.get('/delete/:userid', function (req, res, next) {
  db.query('DELETE FROM users WHERE userid =$1', [Number(req.params.userid)], (err) => {
    if (err) return res.send(err, 'error bang')
    res.redirect('/')
  });
});

return router;
};