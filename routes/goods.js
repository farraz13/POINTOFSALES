var express = require('express');
var router = express.Router();
const path = require('path');
const { isAdmin } = require('../helpers/util');

module.exports = (db) => {
    router.get('/', isAdmin,function (req, res, next) {
        res.render('goodsPage/list' ,{user: req.session.user});
    });

    //DATATABLE
    router.get('/datatable', async (req, res) => {

        try {


            let params = []

            if (req.query.search.value) {
                params.push(`barcode ilike '%${req.query.search.value}%'`)
            }
            if (req.query.search.value) {
                params.push(`name ilike '%${req.query.search.value}%'`)
            }

            const limit = req.query.length
            const offset = req.query.start
            const sortBy = req.query.columns[req.query.order[0].column].data
            const sortMode = req.query.order[0].dir

            const total = await db.query(`select count(*) as total from goods${params.length > 0 ? ` where ${params.join(' or ')}` : ''}`)
            const data = await db.query(`SELECT * FROM goods${params.length > 0 ? ` where ${params.join(' or ')}` : ''} order by ${sortBy} ${sortMode} limit ${limit} offset ${offset} `)

            const response = {
                "draw": Number(req.query.draw),
                "recordsTotal": total.rows[0].total,
                "recordsFiltered": total.rows[0].total,
                "data": data.rows
            }
            res.json(response)
        } catch (error) {
        }
    })
    //akhirDATATABLE

    //DELETE
    router.get('/delete/:barcode', function (req, res, next) {
        db.query('DELETE FROM goods WHERE barcode =$1', [req.params.barcode], (err) => {
            if (err) return res.send(err, 'error bang')
            res.redirect('/goods')
        });
    });
    //akhirDELETE

    //EDIT
    router.get('/edit/:barcode',isAdmin, async function (req, res, next) {
        try {
            const { rows: data } = await db.query('SELECT * FROM goods WHERE barcode =$1', [req.params.barcode])
            const { rows: unit } = await db.query('SELECT * FROM units')

            res.render('goodsPage/edit', { item: data[0], units: unit, user:req.session.user })
        } catch (error) {
            console.log(error)
        }

    });

    router.post('/edit/:barcode', function (req, res, next) {
        let sampleFile;
        let uploadPath;

        const { barcode } = req.params
        const { name, stock, purchaseprice, sellingprice, unit } = req.body

        if (!req.files || Object.keys(req.files).length === 0) {
            db.query('UPDATE public.goods SET name=$1, stock=$2, purchaseprice=$3, sellingprice=$4, unit=$5 WHERE barcode=$6 ', [name, stock, purchaseprice, sellingprice, unit, barcode], (err) => {
                if (err) {
                    return res.send(err, 'error bang')
                }
                res.redirect('/goods')
            })
        } else {
            // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
            sampleFile = req.files.sampleFile;
            const imagesfiles = `${Date.now()}-${sampleFile.name}`

            uploadPath = path.join(__dirname, '..', 'public', 'images', 'upload', imagesfiles);

            // Use the mv() method to place the file somewhere on your server
            sampleFile.mv(uploadPath, function (err) {
                if (err)
                    return res.status(500).send(err);

                
                db.query('UPDATE public.goods SET name=$1, stock=$2, purchaseprice=$3, sellingprice=$4, unit=$5, picture=$6 WHERE barcode=$7 ', [name, stock, purchaseprice, sellingprice, unit, picture, barcode], (err) => {
                    if (err) {
                        return res.send(err, 'error bang')
                    }
                    res.redirect('/goods')
                })
            })
        }


    });
    //akhirEDIT

    //ADD
    router.get('/add', isAdmin, async function (req, res, next) {
        const { rows: unit } = await db.query('SELECT * FROM units')

        res.render('goodsPage/add', { units: unit, user:req.session.user })

    });

    router.post('/add', (req, res) => {
        let sampleFile;
        let uploadPath;

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        sampleFile = req.files.sampleFile;
        const imagesfiles = `${Date.now()}-${sampleFile.name}`

        uploadPath = path.join(__dirname, '..', 'public', 'images', 'upload', imagesfiles);

        // Use the mv() method to place the file somewhere on your server
        sampleFile.mv(uploadPath, function (err) {
            if (err)
                return res.status(500).send(err);

            const { barcode, name, stock, purchaseprice, sellingprice, unit } = req.body
            console.log(barcode, name, stock, purchaseprice, sellingprice)

            db.query('INSERT INTO goods (barcode, name, stock, purchaseprice, sellingprice, unit, picture) VALUES ($1, $2, $3, $4, $5, $6, $7)', [barcode, name, stock, purchaseprice, sellingprice, unit, imagesfiles], (err, data) => {

                if (err) {
                    console.log(err)
                    return console.error(err.message);
                }
                res.redirect('/goods')
            })

        })

    });
    //akhirADD


    return router;
};