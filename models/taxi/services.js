const app = require('express')();

const mysql = require("../db.js"),
    https = require('https'),
    async = require('async'),
    cheerio = require("cheerio"),
    mysqlPool = mysql.createPool();

const request = require('request');
const querystring = require('querystring');


const taxi = function () {
};

taxi.prototype.getAllTaxis = function (req, res, callback) {

    const query = "select t.*, AVG(r.rate) as rate from taxis t left join taxi_comment r ON r.taxi_id = t.id GROUP BY t.id";

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
        const id = req.params.id;
        const query = "select * from taxis where id = ?";

        mysqlPool.query(query, id, function (err, rows) {
            if (err) {
                reject(err);
            } else {

                let queryComment = "select c.*, u.firstName, u.lastName from taxi_comment c  join users u ON c.user_id = u.id where c.taxi_id = ? order by date desc";

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
        const user_id = req.body.user_id;
        const taxi_id = req.body.taxi_id;
        const text = req.body.text;
        const rate = req.body.rate;
        const date = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const query = "INSERT INTO taxi_comment (id, user_id, taxi_id, text, rate, date) values ( '',  '" + user_id + "',  '" + taxi_id + "',  '" + text + "',  '" + rate + "',  '" + date + "')";


        const queryComment = "select  u.firstName, u.lastName from  users u where u.id = ?";


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
                            const newComment = {
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
        const query = "INSERT INTO `taxis` (`name`, `logo`, `type`, `query_id`, `website`, `phone_number`, `short_description`, `min_cost`, `one_cost`, `surb_cost`, `animal_cost`, `premium_cost`) VALUES ?";

        const name = req.body.name;
        const logo = req.body.logo;
        const type = req.body.type;
        const query_id = req.body.query_id;
        const website = req.body.website || null;
        const phone_number = req.body.phone_number || null;
        const short_description = req.body.short_description || null;
        const min_cost = req.body.min_cost || null;
        const one_cost = req.body.one_cost || null;
        const surb_cost = req.body.surb_cost || null;
        const animal_cost = req.body.animal_cost || null;
        const premium_cost = req.body.premium_cost || null;


        const newTaxi = [[
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


        let name = req.body.name;
        const logo = req.body.logo;
        const type = req.body.type;
        const query_id = req.body.query_id;
        const website = req.body.website;
        const phone_number = req.body.phone_number;
        const short_description = req.body.short_description;
        const min_cost = req.body.min_cost;
        const one_cost = req.body.one_cost;
        const surb_cost = req.body.surb_cost;
        const animal_cost = req.body.animal_cost;
        const premium_cost = req.body.premium_cost;



        const newTaxi = {
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
    const urls = [];
    const results = [];
    return new Promise(function (resolve, reject) {
        // const query = "SELECT * from taxis";
        const query = "select t.*, AVG(r.rate) as rate  from taxis t left join taxi_comment r ON r.taxi_id = t.id GROUP BY t.id";

        mysqlPool.query(query, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i]['type'] == 'rainbow') {
                        urls.push({
                            'url': 'https://rainbow.evos.in.ua/ru-RU/' + rows[i]['query_id'] + '/WebOrders/CalcCost',
                            'id': rows[i]['id'],
                            'name': rows[i]['name'],
                            'rate': rows[i]['rate'],
                            'logo': rows[i]['logo'],
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
                                const $ = cheerio.load(body);
                                let cost = $("#dCostBlock").text();

                                cost = parseInt(cost);

                                if (cost){
                                    results.push({
                                        'name': url['name'],
                                        'logo':  url['logo'],
                                        'service_cost': cost,
                                        'rate': url['rate'],
                                    })
                                }

                            });
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
                    results.sort(function(a, b) {
                        const x = a['service_cost'];
                        const y = b['service_cost'];
                        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                    });
                    resolve(results);
                }, timeout)
            }

        });
    });


}


module.exports = new taxi();