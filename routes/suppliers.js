var express = require('express');
const { isLoggedIn } = require('../helpers/util');
var router = express.Router();

module.exports = (db) => {
    router.get('/', function (req, res, next) {
        res.render('suppliersPage/list', {user:req.session.user});
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

        const total = await db.query(`select count(*) as total from suppliers${params.length > 0 ? ` where ${params.join(' or ')}` : ''}`)
        const data = await db.query(`select * from suppliers${params.length > 0 ? ` where ${params.join(' or ')}` : ''} order by ${sortBy} ${sortMode} limit ${limit} offset ${offset} `)
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
    router.get('/delete/:supplierid', isLoggedIn, function (req, res, next) {
        db.query('DELETE FROM suppliers WHERE supplierid =$1', [req.params.supplierid], (err) => {
            if (err) return res.send(err, 'error bang')
            res.redirect('/suppliers')
        });
    });
    //akhirDELETE

    //EDIT
    router.get('/edit/:supplierid', isLoggedIn, async function (req, res, next) {
        try {
           const {rows: data}= await db.query('SELECT * FROM suppliers WHERE supplierid =$1', [req.params.supplierid])
                
             res.render('suppliersPage/edit', { item: data[0], user:req.session.user })
        } catch (error) {
            console.log(error)
        }
        
    });

    router.post('/edit/:supplierid', isLoggedIn, function (req, res, next) {
        const suply = req.params.supplierid
        const { supplierid, name, address, phone } = req.body
        db.query('UPDATE public.suppliers SET supplierid=$1, name=$2, address=$3, phone=$4 WHERE supplierid=$5 ', [supplierid, name, address, phone, suply], (err) => {
            if (err) {
                return res.send(err, 'error bang')
            }
            res.redirect('/suppliers')
        })
    })
    //akhirEDIT

    //ADD
    router.get('/add', isLoggedIn, function (req, res, next) {
        res.render('suppliersPage/add', {user:req.session.user})

    });

    router.post('/add', isLoggedIn, async function (req, res, next) {
        try {
            const { name, address, phone } = req.body

            await db.query('INSERT INTO public.suppliers(name, address, phone) VALUES ($1, $2, $3);', [name, address, phone])

            res.redirect('/suppliers')
        } catch (e) {
            console.log(e)
        }
    });
    //akhirADD


    return router;
};