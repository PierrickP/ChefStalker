var iridium = require('iridium');

var Conf = require('./conf.js');

var database = new iridium({
    connect_url: Conf.connect_url,
    database: 'ChefStalk'
});

database.register('Chef', new iridium.Model(database, 'chef', {
    name: String,
    link: String,
    since: Date,
    status: /ACTIVE|NOACTIVE/
}));

database.register('Activity', new iridium.Model(database, 'activity', {
    date: Date,
    type: /ADD|REMOVED/,
    chefs: [{
        name: String,
        link: String
    }]
}));

module.exports = {
    init: function (cb) {
        database.connect(cb);
    }
};
