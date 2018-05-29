var express = require('express'),
    service = require('../models/taxi/services'),
    router = express.Router();


router.get('/services', function (req, res, next) {

    service.getAllTaxis(req)
        .then(function (value) {
        res.json(value);
    })
        .catch(function (reason) {
            res.status(500);
            res.json({'error': true, 'data': reason});
        })
});


router.post('/services', function (req, res, next) {

    service.addNewTaxi(req)
        .then(function () {
            res.status(201);
            res.send();
        })
        .catch(function (err) {
            res.status(500);
            res.json({'error': true, 'data': err});
        })
});

router.get('/services/:id', function (req, res, next) {


    service.getTaxiByID(req)
        .then(function (data) {
            res.json(data);
        })
        .catch(function (err) {
            res.status(500);
            res.json({'error': true, 'message': 'Ошибка при получении данных', 'data': err});
        })
});

router.put('/services/:id', function (req, res, next) {


    service.editTaxi(req)
        .then(function () {
            res.status(202);
            res.send();
        })
        .catch(function (err) {
            res.status(500);
            res.json({'error': true, 'message': 'Ошибка при получении данных', 'data': err});
        })
});


router.post('/services/comments', function (req, res, next) {
    service.addNewComment(req, res)
        .then(function (data) {
            res.json(data);
        })
        .catch(function (err) {
            res.status(500);
            res.json({'error': true, 'message': 'Ошибка при получении данных', 'data': err});
        });

});
router.get('/calculate', function (req, res, next) {

    service.calcCost(req, res)
        .then(function (data) {
            res.json(data);
        })
        .catch(function (err) {
            res.status(500);
            console.log(err);
            res.json({'error': true, 'data': err});
        })
});
module.exports = router;
