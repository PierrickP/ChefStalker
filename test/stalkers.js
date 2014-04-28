var database = require('../db.js'),
should = require('should');

var db;

describe('Stalkers', function () {

    before(function (cb) {
        database.init(function (err, dbconnection) {
            db = dbconnection;
            db.Stalkers.remove({}, function () {
                cb();
            });
        });
    });

    describe('Add a new Stalker', function () {

        it('Should add a new stalker', function (cb) {
            db.Stalkers.newStalker('little.stalker@mail.com', function (err, stalker) {
                should.not.exist(err);
                should.exist(stalker);
                stalker.email.should.equal('little.stalker@mail.com');
                cb();
            });
        });
    });

    describe('Validation', function () {

        it('Should return an error if we try with the same email ', function (cb) {
            db.Stalkers.newStalker('little.stalker@mail.com', function (err, stalker) {
                should.exist(err);
                should.not.exist(stalker);
                err.should.equal('already');
                cb();
            });
        });

        it('Should return an error if we try with an incorrect email', function (cb) {
            db.Stalkers.newStalker('little.stalker@mail', function (err, stalker) {
                should.exist(err);
                cb();
            });
        });
    });

});
