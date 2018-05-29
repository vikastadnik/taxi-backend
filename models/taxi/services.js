var app = require('express')();

var mysql = require("../db.js"),
    https = require('https'),
    async = require('async'),
    cheerio = require("cheerio"),
    mysqlPool = mysql.createPool();

var request = require('request');
var querystring = require('querystring');


var taxi = function () {
};

taxi.prototype.getAllTaxis = function (req, res, callback) {

    var query = "select t.*, AVG(r.rate) as rate from taxis t left join taxi_comment r ON r.taxi_id = t.id GROUP BY t.id";

    return new Promise(function (resolve, reject) {
        mysqlPool.query(query, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }

        })
    });


};

taxi.prototype.getTaxiByID = function (req) {

    return new Promise(function (resolve, reject) {
        var id = req.params.id;
        var query = "select * from taxis where id = ?";

        mysqlPool.query(query, id, function (err, rows) {
            if (err) {
                reject(err);
            } else {

                var queryComment = "select c.*, u.firstName, u.lastName from taxi_comment c  join users u ON c.user_id = u.id where c.taxi_id = ? order by date desc";

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
                    } else {
                        if (data.length === 0) {
                            reject(err);
                        }
                        else {
                            var newComment = {
                                "taxi_id": taxi_id,
                                "text": text,
                                "rate": parseInt(rate),
                                "date": date,
                                "firstName": data[0].firstName,
                                "lastName": data[0].lastName
                            };
                            resolve(newComment);
                        }
                    }

                })


            }
        });
    });
};

taxi.prototype.addNewTaxi = function (req) {
    return new Promise(function (resolve, reject) {
        var query = "INSERT INTO `taxis` (`name`, `logo`, `type`, `query_id`, `website`, `phone_number`, `short_description`, `min_cost`, `one_cost`, `surb_cost`, `animal_cost`, `premium_cost`) VALUES ?";

        var name = req.body.name;
        var logo = req.body.logo;
        var type = req.body.type;
        var query_id = req.body.query_id;
        var website = req.body.website||null;
        var phone_number = req.body.phone_number||null;
        var short_description = req.body.short_description||null;
        var min_cost = req.body.min_cost||null;
        var one_cost = req.body.one_cost||null;
        var surb_cost = req.body.surb_cost||null;
        var animal_cost = req.body.animal_cost||null;
        var premium_cost = req.body.premium_cost||null;


        var newTaxi = [[
            name,
            logo,
            type,
            query_id,
            website,
            phone_number,
            short_description,
            min_cost,
            one_cost,
            surb_cost,
            animal_cost,
            premium_cost
        ]];

        mysqlPool.query(query, [newTaxi], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

taxi.prototype.editTaxi = function (req) {
    return new Promise(function (resolve, reject) {

        let taxi_id = req.params.id;

        let query = `UPDATE taxis SET ? WHERE taxis.id = ${taxi_id}`;


        var name = req.body.name;
        var logo = req.body.logo;
        var type = req.body.type;
        var query_id = req.body.query_id;
        var website = req.body.website;
        var phone_number = req.body.phone_number;
        var short_description = req.body.short_description;
        var min_cost = req.body.min_cost;
        var one_cost = req.body.one_cost;
        var surb_cost = req.body.surb_cost;
        var animal_cost = req.body.animal_cost;
        var premium_cost = req.body.premium_cost;



        var newTaxi = {
            "name": name,
            "logo": logo,
            "type": type,
            "query_id": query_id,
            "website": website,
            "phone_number": phone_number,
            "short_description": short_description,
            "min_cost": min_cost,
            "one_cost": one_cost,
            "surb_cost": surb_cost,
            "animal_cost": animal_cost,
            "premium_cost": premium_cost
        };

        mysqlPool.query(query, [newTaxi], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });


    });
};

taxi.prototype.calcCost = function (req, res, callback) {
    var urls = [];
    var results = [];
    return new Promise(function (resolve, reject) {
        var query = "SELECT * from taxis";

        mysqlPool.query(query, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i]['type'] == 'rainbow') {
                        urls.push({
                            'url': 'https://rainbow.evos.in.ua/ru-RU/' + rows[i]['query_id'] + '/WebOrders/CalcCost',
                            'id': rows[i]['id']
                        });
                    }
                }

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

                                cost = parseInt(cost);

                                results.push({
                                    'service_id': url['id'],
                                    'service_cost': cost
                                })
                            })
                        callback();
                    },
                    function (err) {
                    }
                );
                let timeout = urls.length * 500;
                if (timeout < 2000) {
                    timeout = 2000;
                } else if (timeout > 5000) {
                    timeout = 5000;
                }
                setTimeout(function (args) {
                    resolve(results);
                }, timeout)
            }

        });
    });


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


module.exports = new taxi();