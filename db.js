var iridium = require('iridium');

var Conf = require('./conf.js');

var database = new iridium({
    host: Conf.host,
    username: Conf.username,
    password: Conf.password,
    database: Conf.database
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

module.exports = {
    init: function (cb) {
        database.connect(cb);
    }
};
