var mysql = require("../db.js"),
    mysqlPool = mysql.createPool(); // connects to Database

var User = require('./user');
/**
 * Defines Signup operations.
 * @class
 */
var signup = function () {
};

/**
 * save user data
 * @Function
 * @param callback
 * @param feedbackQuery
 */
signup.prototype.addUser = function (req, res, callback) {


    var nowDate = new Date().toISOString().slice(0, 19).replace('T', ' '),
        feedbackQuery = "INSERT INTO `users`  SET ?";
    var newUser = new User( req.body.phone_number, req.body.password, req.body.firstName, req.body.lastName, req.body.gender, req.body.email, nowDate);
    newUser.encryptPassword();
    mysqlPool.getConnection(function (err, connection) {
        connection.query(feedbackQuery, newUser , function (err, rows, fields) {
            if (err) {
                connection.release();
                callback(true, null);

            } else {
                connection.release();
                callback(null, true);
            }
        });
    });
}

function encryptPassword(text) {
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decryptPassword(text){
    var decipher = crypto.createDecipher(algorithm,password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}

module.exports = new signup();