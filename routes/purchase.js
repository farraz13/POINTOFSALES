var express = require('express');
const { isLoggedIn } = require('../helpers/util');
var router = express.Router();

module.exports = (db) => {
    router.get('/', function (req, res, next) {
        res.render('purchasePage/list');
    });

    //DATATABLE
    router.get('/datatable', async (req, res) => {
        let params = []

        if (req.query.search.value) {
            params.push(`invoice ilike '%${req.query.search.value}%'`)
        }

        const limit = req.query.length
        const offset = req.query.start
        const sortBy = req.query.columns[req.query.order[0].column].data
        const sortMode = req.query.order[0].dir

        const total = await db.query(`select count(*) as total from purchases${params.length > 0 ? ` where ${params.join(' or ')}` : ''}`)
        const data = await db.query(`select * from purchases${params.length > 0 ? ` where ${params.join(' or ')}` : ''} order by ${sortBy} ${sortMode} limit ${limit} offset ${offset} `)
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
    router.get('/delete/:purchase', isLoggedIn, function (req, res, next) {
        db.query('DELETE FROM purchases WHERE invoice =$1', [req.params.invoice], (err) => {
            if (err) return res.send(err, 'error bang')
            res.redirect('/purchases')
        });
    });
    //akhirDELETE

    //EDIT
    router.get('/edit/:purchase', isLoggedIn, async function (req, res, next) {
        try {
           const {rows: data}= await db.query('SELECT * FROM purchases WHERE invoice =$1', [req.params.purchase])
                
             res.render('purchasesPage/edit', { item: data[0] })
        } catch (error) {
            console.log(error)
        }
        
    });

    router.post('/edit/:purchase', isLoggedIn, function (req, res, next) {
        const purchases = req.params.purchase
        const { purchase, name, note } = req.body
        db.query('UPDATE public.purchases SET purchase=$1, name=$2, note=$3 WHERE purchase=$4 ', [purchase, name, note, purchases], (err) => {
            if (err) {
                return res.send(err, 'error bang')
            }
            res.redirect('/purchases')
        })
    })
    //akhirEDIT

    //ADD
    router.get('/add', isLoggedIn, function (req, res, next) {
        res.render('purchasesPage/add')

    });

    router.post('/add', isLoggedIn, async function (req, res, next) {
        try {
            const { purchase, name, note } = req.body

            await db.query('INSERT INTO purchases (purchase, name, note) VALUES ($1, $2, $3)', [purchase, name, note])

            res.redirect('/purchases')
        } catch (e) {
            console.log(e)
            res.redirect('/purchases')
        }
    });
    //akhirADD


    return router;
};