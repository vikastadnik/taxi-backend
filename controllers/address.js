var express = require('express'),
    router = express.Router(),
    allStreets = require('../models/address/getStreets'),
    getAdress = require('../models/address/getAddress')


router.get('/streets', function (req, res, next) {
    allStreets.getAllStreets(req, res, function (err,  results,  data) {
        if (err) {
            res.json({'error': true, 'message': 'Error adding user .. !', 'data': data});
        } else {
            res.send( results);
        }
    })

    // res.send('Hello World!');

});

router.get('/streetsByName', function (req, res, next) {
    allStreets.getStreetByName(req, res, function (err,  results,  data) {
        if (err) {
            res.json({'error': true, 'message': 'Error adding user .. !', 'data': data});
        } else {
            res.send( results);
        }
    })

    // res.send('Hello World!');

});

router.get('/CheckType', function (req, res, next) {
   allStreets.checkStereet(req, res, function (err,  results,  data){
        res.send( results);
   });


});

module.exports = router;
