var iridium = require('iridium');

module.exports = function (conf) {
    var database = new iridium({
        host: conf.host,
        username: conf.username,
        password: conf.password,
        database: conf.database
    });

    database.register('Chef', new iridium.Model(database, 'chef', {
        name: String,
        link: String,
        since: Date,
        status: /ACTIVE|NOACTIVE/
    }));

    database.register('Activity', new iridium.Model(database, 'activity', {
        date: Date,
        chefsAdded: [{
            name: String,
            link: String
        }],
        chefsRemoved: [{
            name: String,
            link: String
        }]
    }));

    database.Activity.on('creating', function (document) {
        Mail.sendNewActivity(document);
    });

    database.register('Stalkers', new iridium.Model(database, 'stalkers', {
        email: {
            $type: /.+@.+\..+/,
            $required: true
        }
    }));

    database.Stalkers.newStalker =  function (email, cb) {
        var Stalkers = this;
        Stalkers.count({email: email}, function (err, exists) {
            if (err) {
                cb(err);
            } else if (exists !== 0) {
                cb('already');
            } else {
                Stalkers.create({email: email}, function (err, stalker) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, stalker.document);
                    }
                });
            }
        });
    };

    return function (cb) {
        database.connect(cb);
    };
};
