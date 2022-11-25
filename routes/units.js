var express = require('express');
const { isLoggedIn } = require('../helpers/util');
var router = express.Router();

module.exports = (db) => {
    router.get('/', function (req, res, next) {
        res.render('unitsPage/list');
    });

    //DATATABLE
    router.get('/datatable', async (req, res) => {
        let params = []

        if (req.query.search.value) {
            params.push(`unit ilike '%${req.query.search.value}%'`)
        }
        if (req.query.search.value) {
            params.push(`name ilike '%${req.query.search.value}%'`)
        }
        if (req.query.search.value) {
            params.push(`note ilike '%${req.query.search.value}%'`)
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
    router.get('/delete/:unit', isLoggedIn, function (req, res, next) {
        db.query('DELETE FROM units WHERE unit =$1', [req.params.unit], (err) => {
            if (err) return res.send(err, 'error bang')
            res.redirect('/units')
        });
    });
    //akhirDELETE

    //EDIT
    router.get('/edit/:unit', isLoggedIn, async function (req, res, next) {
        try {
           const {rows: data}= await db.query('SELECT * FROM units WHERE unit =$1', [req.params.unit])
                
             res.render('unitsPage/edit', { item: data[0] })
        } catch (error) {
            console.log(error)
        }
        
    });

    router.post('/edit/:unit', isLoggedIn, function (req, res, next) {
        const units = req.params.unit
        const { unit, name, note } = req.body
        db.query('UPDATE public.units SET unit=$1, name=$2, note=$3 WHERE unit=$4 ', [unit, name, note, units], (err) => {
            if (err) {
                return res.send(err, 'error bang')
            }
            res.redirect('/units')
        })
    })
    //akhirEDIT

    //ADD
    router.get('/add', isLoggedIn, function (req, res, next) {
        res.render('unitsPage/add')

    });

    router.post('/add', isLoggedIn, async function (req, res, next) {
        try {
            const { unit, name, note } = req.body

            await db.query('INSERT INTO units (unit, name, note) VALUES ($1, $2, $3)', [unit, name, note])

            res.redirect('/units')
        } catch (e) {
            console.log(e)
            res.redirect('/units')
        }
    });
    //akhirADD


    return router;
};