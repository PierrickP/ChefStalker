require('newrelic');
var express = require('express'),
bodyParser = require('body-parser'),
swig = require('swig');

var app = express();
var conf = require('./conf.js');
var database = require('./db.js')(conf);
var stalk = require('./stalk.js')(conf);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser());
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

database(function (err, db) {
    if (err) throw err;

    app.post('/stalkers', function (req, res) {
        var email = req.param('email');

        if (!email) {
            res.json(500, {error: 'missing email'});
        } else {
            db.Stalkers.newStalker(email, function (err, stalker) {
                if (err) {
                    res.json(500, {error: err});
                } else {
                    res.json({stalker: stalker});
                }
            });
        }
    });

    app.get('/activities', function (req, res) {
        db.Activity.find({}, {sort: {date: -1}, wrap: false}, function (err, data) {
            if (err) {
                res.json(500, {error: err});
            } else {
                res.json({activities: data});
            }
        });
    });

    app.get('/stalk', function (req, res) {
        stalk.run(db, function (err) {
            if (err) {
                res.json(500, {error: err});
            } else {
                res.json({status: 'ok'});
            }
        });
    });

    app.get('/', function (req, res) {
        res.render('spa.html');
    });

    app.listen(conf.port, function () {
        console.log('Server run on ' + conf.port);
    });
});
