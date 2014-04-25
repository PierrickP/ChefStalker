var request = require('request'),
_ = require('lodash'),
cheerio = require('cheerio'),
async = require('async');

var Conf = require('./conf.js');

module.exports = {
    run: function (db, cb) {
        var chefs = [];
        var newChefs = [];
        var removedChefs = [];

        async.waterfall([
            function (next) {

                request(Conf.stalk_url, function (err, response, body) {
                    if (err) {
                        next(err);
                        return;
                    }

                    var $ = cheerio.load(body);
                    $('.item').each(function () {
                        chefs.push({
                            name: $(this).find('h2 a').text().trim(),
                            city: $(this).find('.item h2:nth-child(3)').text().trim(),
                            link: $(this).find('.item a.product-image').attr('href').trim()
                        });
                    });
                    next(null);
                });
            },
            function (next) {
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
                }, next);
            },
            function (next) {
                var chefsName = _.pluck(chefs, 'name');
                db.Chef.find({name: {$nin: chefsName}}, function (err, chefsToDeactivate) {
                    async.each(chefsToDeactivate, function (chefToDeactivate, nextChef) {
                        removedChefs.push({
                            name: chefToDeactivate.name
                        });
                        chefToDeactivate.status = 'NOACTIVE';
                        chefToDeactivate.save(nextChef);
                    }, next);
                });
            },
            function (next) {

                if (newChefs.length > 0 || removedChefs.length > 0) {
                    db.Activity.create({
                        date: new Date(),
                        chefsAdded: _.map(newChefs, function (chef) {
                            return {
                                name: chef.name,
                                link: chef.link
                            };
                        }),
                        chefsRemoved: _.map(removedChefs, function (chef) {
                            return {
                                name: chef.name,
                                link: chef.link
                            };
                        })
                    }, cb);
                } else {
                   cb(null);
                }
            }
        ], function (err) {
            cb(err);
        });
    }
};




