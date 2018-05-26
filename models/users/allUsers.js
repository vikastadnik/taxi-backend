/**
 * Created by Vika on 26.04.2018.
 */
var mysql = require("../db.js"),
    mysqlPool = mysql.createPool(); // connects to Database

var allUsers = function () {
};

allUsers.prototype.getAllUsers = function (req, res, callback) {

    var query =  "SELECT * from users";
    mysqlPool.getConnection(function (err, connection) {
        if (err) {
            connection.release();
            callback(true, null);

        } else {
            connection.release();
            callback(null, true);
        }
    });
}

module.exports = new allUsers();
