var express = require('express'),
    service = require('../models/taxi/services'),
    router = express.Router();


router.get('/services', function (req, res, next) {

    service.getAllTaxis(req, res, function (err, results, data) {
        if (err) {
            res.json({'error': true, 'message': 'Ошибка при получении данных', 'data': data});
        } else {
            res.send(results);
        }
    })
});

router.get('/services/:id', function (req, res, next) {


    service.getTaxiByID(req)
        .then(function (data) {
            res.json(data);
        })
        .catch(function () {
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

    service.calcCost(req, res, function (err, results, data) {
        res.send(results);
    });
});
module.exports = router;
