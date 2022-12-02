var express = require('express');
const { isLoggedIn } = require('../helpers/util');
var router = express.Router();

module.exports = (db) => {
    router.get('/', function (req, res, next) {
        res.render('customersPage/list');
    });

    //DATATABLE
    router.get('/datatable', async (req, res) => {
        let params = []

        if (req.query.search.value) {
            params.push(`phone ilike '%${req.query.search.value}%'`)
        }
        if (req.query.search.value) {
            params.push(`name ilike '%${req.query.search.value}%'`)
        }
        if (req.query.search.value) {
            params.push(`address ilike '%${req.query.search.value}%'`)
        }

        const limit = req.query.length
        const offset = req.query.start
        const sortBy = req.query.columns[req.query.order[0].column].data
        const sortMode = req.query.order[0].dir

        const total = await db.query(`select count(*) as total from customers${params.length > 0 ? ` where ${params.join(' or ')}` : ''}`)
        const data = await db.query(`select * from customers${params.length > 0 ? ` where ${params.join(' or ')}` : ''} order by ${sortBy} ${sortMode} limit ${limit} offset ${offset} `)
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
    router.get('/delete/:customerid', isLoggedIn, function (req, res, next) {
        db.query('DELETE FROM customers WHERE customerid =$1', [req.params.customerid], (err) => {
            if (err) return res.send(err, 'error bang')
            res.redirect('/customers')
        });
    });
    //akhirDELETE

    //EDIT
    router.get('/edit/:customerid', isLoggedIn, async function (req, res, next) {
        try {
           const {rows: data}= await db.query('SELECT * FROM customers WHERE customerid =$1', [req.params.customerid])
                
             res.render('customersPage/edit', { item: data[0] })
        } catch (error) {
            console.log(error)
        }
        
    });

    router.post('/edit/:customerid', isLoggedIn, function (req, res, next) {
        const customer = req.params.customerid
        const { customerid, name, address, phone } = req.body
        db.query('UPDATE public.customers SET customerid=$1, name=$2, address=$3, phone=$4 WHERE customerid=$5 ', [ customerid, name, address, phone, customer ], (err) => {
            if (err) {
                return res.send(err, 'error bang')
            }
            res.redirect('/customers')
        })
    })
    //akhirEDIT

    //ADD
    router.get('/add', isLoggedIn, function (req, res, next) {
        res.render('customersPage/add')

    });

    router.post('/add', isLoggedIn, async function (req, res, next) {
        try {
            const { customerid, name, address, phone } = req.body

            await db.query('INSERT INTO customers (customerid, name, address, phone) VALUES ($1, $2, $3, $4)', [customerid, name, address, phone])

            res.redirect('/customers')
        } catch (e) {
            console.log(e)
            res.redirect('/customers')
        }
    });
    //akhirADD


    return router;
};