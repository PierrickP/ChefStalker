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

module.exports = {
    init: function (cb) {
        database.connect(cb);
    }
};
