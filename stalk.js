var request = require('request'),
_ = require('lodash'),
cheerio = require('cheerio'),
async = require('async');

var Conf = require('./conf.js');

var chefs = [];
var newChefs = [];

module.exports = {
    run: function (db, cb) {
        request(Conf.stalk_url, function (err, response, body) {
            if (err) {
                cb(err);
                return;
            }

            var $ = cheerio.load(body);

            $('.item').each(function () {
                chefs.push({
                    name: $(this).find('h2 a').text(),
                    city: $(this).find('.item h2:nth-child(3)').text(),
                    link: $(this).find('.item a.product-image').attr('href')
                });
            });

            async.each(chefs, function (chef, nextChef) {
                db.Chef.findOne({name: chef.name}, function (err, obj) {
                    if (err) {
                        nextChef(err);
                    } else {
                        if (!obj) {
                            db.Chef.create({
                                name: chef.name,
                                link: chef.link,
                                since: new Date(),
                                status: 'ACTIVE'
                            }, function (err) {
                                if (err) {
                                    nextChef(err);
                                } else {
                                    newChefs.push(chef);
                                    nextChef(null);
                                }
                            });
                        } else {
                           nextChef(null);
                        }
                    }
                });
            }, function (err) {
                if (err) {
                    cb(err);
                    return;
                }

                if (newChefs.length > 0) {
                    db.Activity.create({
                        date: new Date(),
                        type: 'ADD',
                        chefs: _.map(newChefs, function (chef) {
                            return {
                                name: chef.name,
                                link: chef.link
                            };
                        })
                    }, cb);
                } else {
                   cb(null);
                }
            });
        });
    }
};




