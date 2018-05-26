var express = require('express'),
    router = express.Router(),
    signup = require('../models/users/signup.js'),
    allUsers = require('../models/users/allUsers.js');
    login = require('../models/users/login.js');

router.post('/signup', function (req, res) {
    signup.addUser(req, res, function (err, data) {
        if (err) {
            res.json({'error': true, 'message': 'Error adding user .. !', 'data': data});
        } else {
            res.json({'success': true, 'message': 'User added succesfully'});
        }
    });
});

router.post('/login', function(req, res) {
    login.loginUser(req, res, function(err, data) {
        if (err) {
            res.json({ 'error': true, 'message': 'Error logged in' });
        } else {
            res.json({ 'success': true, 'data': data });
        }
    });
});




router.get('/', function (req, res, next) {
    allUsers.getAllUsers(req, res, function (err,  results,  data) {
        if (err) {
            res.json({'error': true, 'message': 'Error adding user .. !', 'data': data});
        } else {
            res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        }
    })

    // res.send('Hello World!');

});
module.exports = router;
