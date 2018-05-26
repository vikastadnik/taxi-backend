/**
 * Created by Vika on 26.04.2018.
 */
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'uzinah11';


function User (phone_number, password, firstName, 	lastName, gender, email, created){
    this.phone_number = phone_number;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.gender = gender;
    this.email = email;
    this.created =  created;
    this.lastLogin = '';
}

User.prototype.encryptPassword = function () {
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(this.password,'utf8','hex')
    crypted += cipher.final('hex');
    this.password = crypted;
}

User.prototype.decryptPassword = function () {
    var decipher = crypto.createDecipher(algorithm,password)
    var dec = decipher.update(this.password,'hex','utf8')
    dec += decipher.final('utf8');
    this.password=  dec;
}


module.exports = User;