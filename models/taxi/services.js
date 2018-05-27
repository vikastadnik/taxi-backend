var app = require('express')();

var mysql = require("../db.js"),
    https = require('https'),
    async = require('async'),
    cheerio = require("cheerio"),
    mysqlPool = mysql.createPool();

var request = require('request');
var querystring = require('querystring');
var urls = [];
var results = [];


var taxi = function () {
};

taxi.prototype.getAllTaxis = function (req, res, callback) {

    var query = "select t.*, AVG(r.rate) as rate from Taxis t left join Taxi_Comment r ON r.taxi_id = t.id GROUP BY t.id";

    mysqlPool.query(query, function (err, rows) {
        if (err) {
            callback(true, err);
        } else {
            callback(null, rows);
        }

    })
};

taxi.prototype.getTaxiByID = function (req) {

    return new Promise(function (resolve, reject) {
        var id = req.params.id;
        var query = "select * from taxis where id = ?";

        mysqlPool.query(query, id, function (err, rows) {
            if (err) {
                reject(err);
            } else {

                var queryComment = "select c.*, u.firstName, u.lastName from taxi_comment c  join users u ON c.user_id = u.id where c.taxi_id = ?";

                mysqlPool.query(queryComment, id, function (err, rowsComment) {
                    if (err) {
                        reject(err);
                    } else {
                        rows[0]['comments'] = rowsComment;
                        resolve(rows);
                    }
                });

            }

        })
    })


}

taxi.prototype.addNewComment = function (req, res) {

    return new Promise(function (resolve, reject) {

        var user_id = req.body.user_id;
        var taxi_id = req.body.taxi_id;
        var text = req.body.text;
        var rate = req.body.rate;
        var date = new Date().toISOString().slice(0, 19).replace('T', ' ');

        var query = "INSERT INTO taxi_comment (id, user_id, taxi_id, text, rate, date) values ( '',  '" + user_id + "',  '" + taxi_id + "',  '" + text + "',  '" + rate + "',  '" + date + "')";


        var queryComment = "select  u.firstName, u.lastName from  users u where u.id = ?";


        mysqlPool.query(query, function (err, rows) {

            if (err) {
                reject(err);
            } else {
                mysqlPool.query(queryComment, user_id, function (err, data) {
                    if (err) {
                        reject(err)
                    } else{
                        console.log(data);

                        if ( data.length===0){
                            reject(err);
                        }
                        else{
                            var newComment = {
                                "taxi_id": taxi_id,
                                "text": text,
                                "rate": parseInt(rate),
                                "date": date,
                                "firstName": data[0].firstName,
                                "lastName": data[0].lastName
                            }
                            resolve(newComment);
                        }


                    }

                })


            }
        });
    });

};

taxi.prototype.calcCost = function (req, res, callback) {


    var query = "SELECT * from taxis";

    mysqlPool.query(query, function (err, rows) {
        if (err) {
            callback(true, err);
        } else {
            for (var i = 0; i < rows.length; i++) {
                if (rows[i]['type'] == 'rainbow') {
                    urls.push({
                        'url': 'https://rainbow.evos.in.ua/ru-RU/' + rows[i]['query_id'] + '/WebOrders/CalcCost',
                        'id': rows[i]['id']
                    });
                }
            }
            // var iterator  =0;
            async.each(
                urls,
                function (url, callback) {

                    request.post({
                            url: url['url'],
                            form: 'LocationFrom.Address=' + encodeURIComponent(req.query.fromAddress) + '&LocationFrom.AddressNumber=' + encodeURIComponent(req.query.fromNumber) + '&LocationFrom.Entrance=&LocationFrom.IsStreet=True&LocationFrom.Comment=&IsRouteUndefined=false&LocationsTo%5B0%5D.Address=' + encodeURIComponent(req.query.toAddress) + '&LocationsTo%5B0%5D.AddressNumber=' + encodeURIComponent(req.query.toNumber) + '&LocationsTo%5B0%5D.IsStreet=True&ReservationType=None&ReservationDate=&ReservationTime=&IsWagon=false&IsMinibus=false&IsPremium=false&IsConditioner=false&IsBaggage=false&IsAnimal=false&IsCourierDelivery=false&IsReceipt=false&UserFullName=&UserPhone=&AdditionalCost=&OrderUid=&Cost=&UserBonuses=&calcCostInProgress=False&IsPayBonuses=False&IsManualCalc=False'
                        },
                        function (err, httpResponse, body) {
                            var $ = cheerio.load(body),
                                cost = $("#dCostBlock").text();

                            // results.push(2);

                            results.push({
                                'service_id': url['id'],

                                'service_cost': cost
                            })
                        })
                    callback();
                },
                function (err) {
                    console.log("Hello");
                    if (err) {
                        console.log("Error grabbing data");
                    } else {
                        console.log(results);
                    }
                }
            );


            setTimeout(function (args) {
                console.log(results);
            }, 3000)


        }

    })


    // request.post({
    //     url: 'https://rainbow.evos.in.ua/ru-RU/adfe0530-4bd0-4ac2-98bd-db25ef337af4/WebOrders/CalcCost',
    //     form: 'LocationFrom.Address='+encodeURIComponent(req.query.fromAddress) +'&LocationFrom.AddressNumber='+  encodeURIComponent(req.query.fromNumber)+'&LocationFrom.Entrance=&LocationFrom.IsStreet=True&LocationFrom.Comment=&IsRouteUndefined=false&LocationsTo%5B0%5D.Address='+ encodeURIComponent(req.query.toAddress)+'&LocationsTo%5B0%5D.AddressNumber='+ encodeURIComponent(req.query.toNumber)+'&LocationsTo%5B0%5D.IsStreet=True&ReservationType=None&ReservationDate=&ReservationTime=&IsWagon=false&IsMinibus=false&IsPremium=false&IsConditioner=false&IsBaggage=false&IsAnimal=false&IsCourierDelivery=false&IsReceipt=false&UserFullName=&UserPhone=&AdditionalCost=&OrderUid=&Cost=&UserBonuses=&calcCostInProgress=False&IsPayBonuses=False&IsManualCalc=False'
    // }, function (err, httpResponse, body) {
    //     // console.log(body)
    // })

    // var r = request.post("https://rainbow.evos.in.ua/ru-RU/adfe0530-4bd0-4ac2-98bd-db25ef337af4/WebOrders/CalcCost", function (err, res, body) {
    //     console.log(body);
    // });
    //
    // r._form = formData;


    // var query =  "SELECT * from taxis";


    // mysqlPool.query(query, function (err, rows) {
    //     if (err) {
    //         callback(true, err);
    //     } else{
    //         for(var i = 0; i < rows.length;i++){
    //
    //             if (rows[i]['type'] == 'rainbow'){
    //                 urls.push('https://rainbow.evos.in.ua/ru-RU/'+rows[i]['query_id']+'/WebOrders/CalcCost');
    //             }
    //            console.log(rows[i]['type']);
    //         }
    //        makeRequest(urls[0]);
    //     }
    //
    // })

}
//
// function makeRequest(url,  callback) {
//     // request object
//     var req = https.request(url, function (res) {
//         var result = '';
//         res.on('data', function (chunk) {
//             result += chunk;
//         });
//         res.on('end', function () {
//             console.log(result);
//         });
//         res.on('error', function (err) {
//             console.log(err);
//         })
//     });
//
// // req error
//     req.on('error', function (err) {
//         console.log(err);
//     });
//
// //send request witht the postData form
// //     req.write(postData);
//     req.end();
// }

module.exports = new taxi();