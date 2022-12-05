var express = require('express');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var router = express.Router();
const { isLoggedIn } = require('../helpers/util');
const moment = require("moment");

module.exports = (db) => {
  router.get('/', isLoggedIn, async function (req, res, next) {
    try {
      const { rows } = await db.query('SELECT * FROM sales');
      res.render('salePage/list', {
        user: req.session.user,
        currentPage: 'POS - Sales',
        user: req.session.user,
        rows,
      });
    } catch (err) {
      res.send(err);
    }
  });

  router.get('/datatable', async (req, res) => {
    let params = []

    if(req.query.search.value){
        params.push(`invoice ilike '%${req.query.search.value}%'`)
    }

    const limit = req.query.length
    const offset = req.query.start
    const sortBy = req.query.columns[req.query.order[0].column].data
    const sortMode = req.query.order[0].dir

    const total = await db.query(`select count(*) as total from sales${params.length > 0 ? ` where ${params.join(' or ')}` : ''}`)
    // const data = await db.query(`select * from sales${params.length > 0 ? ` where ${params.join(' or ')}` : ''} order by ${sortBy} ${sortMode} limit ${limit} offset ${offset} `)
    const data = await db.query(`SELECT sales.*, customers.* FROM sales LEFT JOIN customers ON sales.customer = customers.customerid${params.length > 0 ? ` where ${params.join(' or ')}` : ''} order by ${sortBy} ${sortMode} limit ${limit} offset ${offset} `)

    const response = {
        "draw": Number(req.query.draw),
        "recordsTotal": total.rows[0].total,
        "recordsFiltered": total.rows[0].total,
        "data": data.rows
      }
    res.json(response)
})

router.get('/create', isLoggedIn, async  (req, res, next) => {
  try {
    const {userid} = req.session.user
    const { rows } = await db.query('INSERT INTO sales(totalsum, operator) VALUES(0, $1) returning *', [userid])
    res.redirect(`/sale/show/${rows[0].invoice}`)
    //console.log(rows);
  }catch(e){
    console.log(e);

    res.send(e)
  }
})

router.get('/show/:invoice', isLoggedIn, async  (req, res, next) => {
  try {
    const {invoice} = req.params 
    const sales = await db.query('SELECT p.*, s.* FROM sales as p LEFT JOIN customers as s ON p.customer = s.customerid WHERE invoice = $1', [invoice])
    const users = await db.query(' SELECT * FROM users ORDER BY userid')
    const {rows : goods} = await db.query('SELECT barcode, name FROM goods ORDER BY barcode')
    const {rows} = await db.query('SELECT * FROM customers ORDER BY customerid')
    res.render('salePage/form', {
      currentPage: 'Sales',
      user: req.session.user,
      sales: sales.rows[0],
      goods,
      users,
      customer: rows,
      moment
    })
  }catch(e){
    res.send(e)
  }
})

router.post('/show/:invoice', isLoggedIn, async (req, res) => {
  try {
    const { invoice } = req.params
    const { totalsum, pay, change, customer } = req.body
    
    await db.query('UPDATE sales SET totalsum = $1, pay = $2, change = $3, customer = $4 WHERE invoice = $5', [totalsum, pay, change, customer, invoice])

    res.redirect('/sale')
  } catch (error) {
    console.log(error)
    return res.redirect('/sale')
  }
})

router.get('/goods/:barcode', isLoggedIn, async (req, res)=> {
  try{
    const {barcode} = req.params
    const {rows} = await db.query('SELECT * FROM goods WHERE barcode = $1', [barcode])
    res.json(rows[0])
  }catch(e){
    res.send(e)
  }
})

router.post('/additem', isLoggedIn, async (req, res) => {
  try {
    const { invoice, itemcode, quantity } = req.body
    const {rows: n} = await db.query('INSERT INTO saleitems (invoice, itemcode, quantity)VALUES ($1, $2, $3)', [invoice, itemcode, quantity]);
    const { rows } = await db.query('SELECT * FROM sales WHERE invoice = $1', [invoice])

  console.log(rows[0])
  console.log(n)
  
    res.json(rows[0])
  } catch (err) {
    console.log(err)
    res.send(err)
  }
})

router.get('/details/:invoice', isLoggedIn, async (req, res, next) => {
  try {
    const { invoice } = req.params
    const { rows: data } = await db.query('SELECT saleitems.*, goods.name FROM saleitems LEFT JOIN goods ON saleitems.itemcode = goods.barcode WHERE saleitems.invoice = $1 ORDER BY saleitems.id', [invoice])

    res.json(data)
  } catch (err) {
    console.log(err)
  }
});

router.get('/deleteitems/:id', isLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params
    const { rows: data } = await db.query('DELETE FROM saleitems WHERE id = $1 returning *', [id])
    
    res.redirect(`/sale/show/${data[0].invoice}`)
  } catch (err) {

    console.log(err)
  }
});

router.get('/delete/:invoice', isLoggedIn, async (req, res, next) => {
  try {
    const { invoice } = req.params
    await db.query('DELETE FROM sales WHERE invoice = $1', [invoice])
  
    res.redirect('/sale');
  } catch (err) {
    return res.redirect('/sale')
  }
});

  return router
}