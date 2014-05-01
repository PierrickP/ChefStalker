var should = require('should'),
cheerio = require('cheerio');

var conf = {
    stalk_url: 'http://localhost/chef', // will be spoof by nock
    host: 'localhost:27017',
    database: 'ChefStalk_test',
    mail_type: 'stub',
};

var database = require('../db.js')(conf);
var stalk = require('../stalk.js')(conf);

var db, mail;

var activity = {
    date: new Date('2014-05-01T12:56:29.913Z'),
    chefsAdded: [{
        name: 'Jean',
        link: 'http://localhost/jean.html'
    }, {
        name: 'Pierre',
        link: 'http://localhost/pierre.html'
    }],
    chefsRemoved: [{
        name: 'Michelle',
        link: 'http://localhost/michelle.html'
    }]
};

describe('Mail', function () {

    before(function (cb) {
        database(function (err, d) {
            db = d;
            mail = require('../mailer.js')(db, conf);

            db.Stalkers.remove({}, function () {
                db.Stalkers.newStalker('toto@mail.com', function (err, stalker) {
                    db.Stalkers.newStalker('trotro@mail.com', function (err, stalker) {
                        cb();
                    });
                });
            });

        });
    });

    it('Should send a mail with sendNewActivity', function (cb) {
        mail.sendNewActivity(activity, function (err, m, html) {
            should.not.exist(err);
            m.envelope.to[0].should.equal('toto@mail.com');
            m.envelope.to[1].should.equal('trotro@mail.com');

            var $ = cheerio.load(html);
            var date = $('.subtitleDate').text();
            var chefsAdded = $('.chefsAdded');
            var chefsRemoved = $('.chefsRemoved');

            date.should.equal('01/05/2014 12:56');
            chefsAdded.find('li').should.length(2);
            chefsRemoved.find('li').should.length(1);

            cb();
        });
    });

});
