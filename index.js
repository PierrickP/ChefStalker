var express = require('express'),
swig = require('swig');

var app = express();
var database = require('./db.js');
var Conf = require('./conf.js');
var stalk = require('./stalk.js');

app.use(express.static(__dirname + '/public'));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

database.init(function (err, db) {
    if (err) throw err;

    app.get('/activities', function (req, res) {
        db.Activity.find({}, {sort: {date: -1}, wrap: false}, function (err, data) {
            if (err) {
                res.json(500, {error: err});
            } else {
                res.json({activities: data});
            }
        });
    });

    app.get('/scrap', function (req, res) {
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

    app.listen(Conf.port, function () {
        console.log('Server run on ' + Conf.port);
    });
});
