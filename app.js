var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

var db = require('./models/db.js');

if(GLOBAL.SQLpool === undefined){
    GLOBAL.SQLpool = db.createPool(); //create a global sql pool connection
}

var accessLogStream = fs.createWriteStream(__dirname + '/logs/access.log', {flags: 'a'});
// setup the logger

app.use(allowCrossDomain);
    //some other code

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('./controllers'));

app.get('/',function(req,res){
    res.sendFile(__dirname + "/index.html");
});

app.listen('3000', function(){

});
