var should = require('should'),
nock = require('nock');

var conf = {
    stalk_url: 'http://localhost/chef', // will be spoof by nock
    host: 'localhost:27017',
    database: 'ChefStalk_test',
    mail_type: 'stub',
};

var database = require('../db.js')(conf);
var stalk = require('../stalk.js')(conf);

var db;

describe('Stalk', function () {

	before(function (cb) {
		database(function (err, d) {
			db = d;

			global.Mail = require('../mailer.js')(db, conf);

			db.Chef.remove({}, function () {
				db.Activity.remove({}, function () {
					cb();
				});
			});
		});
	});

	describe('After first run - chef database', function () {
		before(function () {
			nock('http://localhost')
				.get('/chef')
				.replyWithFile(200, __dirname + '/two_chefs.html');
		});

		it('Should have 2 chefs', function (cb) {
			stalk.run(db, function () {
				db.Chef.count(function (err, data) {
					data.should.equal(2);
					cb();
				});
			});
		});

		it('Should be ACTIVE', function (cb) {
			db.Chef.find({}, function (err, data) {
				data.forEach(function (chef) {
					chef.status.should.equal('ACTIVE');
				});
				cb();
			});
		});

		it('Should have name for the first chef', function (cb) {
			db.Chef.find({}, function (err, data) {
				should.exist(data[0].name);
				cb();
			});
		});

		it('Should have "Pierre" name for the first chef', function (cb) {
			db.Chef.find({}, function (err, data) {
				data[0].name.should.equal('Pierre');
				cb();
			});
		});

		after(function () {
			nock.cleanAll();
		});
	});

	describe('After first run - activity database', function () {
		it('Should have 1 activity', function (cb) {
			db.Activity.count({}, function (err, data) {
				data.should.equal(1);
				cb();
			});
		});

		it('Should have 2 chefs on chefsAdded array', function (cb) {
			db.Activity.find({}, function (err, data) {
				should.exist(data[0].chefsAdded);
				data[0].chefsAdded.should.be.an.instanceOf(Array);
				data[0].chefsAdded.should.have.length(2);
				cb();
			});
		});

		it('Should have 0 chefs on chefsRemoved array', function (cb) {
			db.Activity.find({}, function (err, data) {
				should.exist(data[0].chefsRemoved);
				data[0].chefsRemoved.should.be.an.instanceOf(Array);
				data[0].chefsRemoved.should.have.length(0);
				cb();
			});
		});

		it('Should be correctly filed with name and link', function (cb) {
			db.Activity.find({}, function (err, data) {
				var chef = data[0].chefsAdded[0];
				should.exist(chef.name);
				should.exist(chef.link);
				cb();
			});
		});
	});

	describe('After second run', function () {
		before(function () {
			nock('http://localhost')
				.get('/chef')
				.replyWithFile(200, __dirname + '/two_chefs.html');
		});

		it('Should still have 2 chefs', function (cb) {
			stalk.run(db, function () {
				db.Chef.count(function (err, data) {
					data.should.equal(2);
					cb();
				});
			});
		});

		it('Should still be ACTIVE', function (cb) {
			db.Chef.find({}, function (err, data) {
				data.forEach(function (chef) {
					chef.status.should.equal('ACTIVE');
				});
				cb();
			});
		});

		it('Should still have 1 activity', function (cb) {
			db.Activity.count(function (err, data) {
				data.should.equal(1);
				cb();
			});
		});

		after(function () {
			nock.cleanAll();
		});
	});

	describe('After a new chef', function () {
		before(function () {
			nock('http://localhost')
				.get('/chef')
				.replyWithFile(200, __dirname + '/three_chefs.html');
		});

		it('Should have 3 chefs', function (cb) {
			stalk.run(db, function () {
				db.Chef.count(function (err, data) {
					data.should.equal(3);
					cb();
				});
			});
		});

		it('Should have a second activity', function (cb) {
			db.Activity.count(function (err, data) {
				data.should.equal(2);
				cb();
			});
		});

		after(function () {
			nock.cleanAll();
		});
	});

	describe('After a removed chef', function () {
		before(function () {
			nock('http://localhost')
				.get('/chef')
				.replyWithFile(200, __dirname + '/two_chefs.html');
		});

		it('Should still have 3 chefs', function (cb) {
			stalk.run(db, function (err) {
				should.not.exist(err);
				db.Chef.count(function (err, data) {
					data.should.equal(3);
					cb();
				});
			});
		});

		it('Should have 2 ACTIVE and 1 NOACTIVE', function (cb) {
			var active = 0;
			var noactive = 0;

			db.Chef.find({}, function (err, data) {
				data.forEach(function (chef){
					if (chef.status === 'ACTIVE') {
						active += 1;
					} else if (chef.status == 'NOACTIVE') {
						noactive += 1;
					}
				});
				active.should.equal(2);
				noactive.should.equal(1);
				cb();
			});
		});

		it('Should have a third activity', function (cb) {
			db.Activity.count({}, function (err, data) {
				data.should.equal(3);
				cb();
			});
		});

		it('Should have a third activity with 0 Added & 1 removed', function (cb) {
			db.Activity.find({}, function (err, data) {
				data.should.have.length(3);
				data[2].chefsAdded.should.have.length(0);
				data[2].chefsRemoved.should.have.length(1);
				cb();
			});
		});

		it('Should "Michelle" to be the removed chef', function (cb) {
			db.Activity.find({}, function (err, data) {
				var chef = data[2].chefsRemoved[0];
				chef.name.should.equal('Michelle');
				cb();
			});
		});

		after(function () {
			nock.cleanAll();
		});
	});

});
