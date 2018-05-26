var mysql =	require("../db.js"),
    mysqlPool = mysql.createPool();
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'uzinah11';
/**
 * Defines login operations.
 * @class
 */
var login = function(){};

/**
 * Authenticate user.
 * @Function
 * @param callback
 */


login.prototype.loginUser = function(req, res, callback){
    var nowDate = new Date().toISOString().slice(0, 19).replace('T', ' '),
        password1 = decryptPassword(req.body.password),
        params = [req.body.phone_number,  password1 ,1],
        detailParams = [],
        updateParams = [],

        loginUserQuery = 'SELECT * FROM users WHERE phone_number = ? AND password = ?',
        getDetailQuery = 'SELECT id, email, gender, lastLogin, firstName FROM users WHERE id = ?',
        updateLastloginTime = 'UPDATE users SET lastLogin = ? WHERE id = ?'; //updates the date of lastlogin field
    mysqlPool.getConnection(function(err, connection){
        connection.query(loginUserQuery, params, function(err, rows, fields) {
            if(rows.length <= 0){
                connection.release();
                callback(true, null);
            }else{
                updateParams = [nowDate, rows[0].id];
                detailParams = [rows[0].id];
                req.session.user = rows[0];
                connection.query(updateLastloginTime, updateParams, function(err, rows, fields) {
                    connection.query(getDetailQuery, detailParams, function(err, rows, fields) {
                        connection.release();
                        callback(null, rows[0]);
                    });
                });
            }
        });
    });
}
function decryptPassword (text) {
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(this.password,'utf8','hex')
    crypted += cipher.final('hex');

   return crypted;
}
module.exports = new login();