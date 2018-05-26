var mysql = require("../db.js"),
    mysqlPool = mysql.createPool(),
    http = require('https');
var request = require('request');


var allStreets= function () { };

allStreets.prototype.getAllStreets = function (req, res, callback) {

    var query =  "SELECT * from streets";
    mysqlPool.query(query, function (err, rows) {
        if (err) {
            callback(true, err);
        } else{
            callback(null, rows);
        }

    })
}

allStreets.prototype.getStreetByName = function (req, res, callback) {
    var foundName = req.query.searched;
    var query =  "SELECT * from streets where name LIKE ?";

    mysqlPool.query(query, foundName+"%",  function (err, rows) {
        if (err) {
            callback(true, err);
        } else{
            callback(null, rows);
        }

    })
}

allStreets.prototype.checkStereet= function (req, res, callback) {
    var foundName = req.query.searched;

    request('https://rainbow.evos.in.ua/ru-RU/66a2d34a-507e-4492-9a63-6fadb009a6ea/Address/CheckType?address='+ encodeURIComponent(foundName)+'.&lpIndex=0', function(err, res, body) {
        if (err) {
            callback(true, err);
        } else{
            console.log(body)
            callback(null, body);
        }
    });

};

module.exports = new allStreets();