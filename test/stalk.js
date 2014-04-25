var stalk = require('../stalk.js'),
should = require('should'),
nock = require('nock');

function Chef(data) {
	this.name = data.name;
	this.status = data.status;
}

Chef.prototype.save = function (cb) {
	cb(null, this);
};

var db = {
	Chef: {
		data: [],
		create: function (data, cb) {
			db.Chef.data.push(new Chef(data));
			cb(null, data);
		},
		find: function (query, cb) {
			var removed = [];

			db.Chef.data.forEach(function (el) {
				if (query.name['$nin'].indexOf(el.name) === -1) {
					removed.push(el);
				}
			});
			cb(null, removed);
		},
		findOne: function (query, cb) {
			var chef = null;
			db.Chef.data.forEach(function (el) {
				if (el.name == query.name) {
					chef = el;
				}
			});
			cb(null, chef);
		}
	},
	Activity: {
		data: [],
		create: function (data, cb) {
			db.Activity.data.push(data);
			cb(null, data);
		}
	}
};

describe('Stalk', function () {

	before(function () {
		db.Chef.data = [];
		db.Activity.data = [];
	});

	describe('After first run - chef database', function () {
		before(function () {
			nock('http://localhost')
				.get('/chef')
				.replyWithFile(200, __dirname + '/two_chefs.html');
		});

		it('Should have 2 chefs', function (cb) {
			stalk.run(db, function () {
				db.Chef.data.should.have.length(2);
				cb();
			});
		});

		it('Should be ACTIVE', function () {
			db.Chef.data.forEach(function (chef){
				chef.status.should.equal('ACTIVE');
			});
		});

		it('Should have name for the first chef', function () {
			should.exist(db.Chef.data[0].name);
		});

		it('Should have "Pierre" name for the first chef', function () {
			db.Chef.data[0].name.should.equal('Pierre');
		});

		after(function () {
			nock.cleanAll();
		});
	});

	describe('After first run - activity database', function () {
		it('Should have 1 activity', function () {
			db.Activity.data.should.have.length(1);
		});

		it('Should have 2 chefs on chefsAdded array', function () {
			should.exist(db.Activity.data[0].chefsAdded);
			db.Activity.data[0].chefsAdded.should.be.an.instanceOf(Array);
			db.Activity.data[0].chefsAdded.should.have.length(2);
		});

		it('Should have 0 chefs on chefsRemoved array', function () {
			should.exist(db.Activity.data[0].chefsRemoved);
			db.Activity.data[0].chefsRemoved.should.be.an.instanceOf(Array);
			db.Activity.data[0].chefsRemoved.should.have.length(0);
		});

		it('Should be correctly filed with name and link', function () {
			var chef = db.Activity.data[0].chefsAdded[0];
			should.exist(chef.name);
			should.exist(chef.link);
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
				db.Chef.data.should.have.length(2);
				cb();
			});
		});

		it('Should still be ACTIVE', function () {
			db.Chef.data.forEach(function (chef){
				chef.status.should.equal('ACTIVE');
			});
		});

		it('Should still have 1 activity', function () {
			db.Activity.data.should.have.length(1);
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
				db.Chef.data.should.have.length(3);
				cb();
			});
		});

		it('Should have a second activity', function () {
			db.Activity.data.should.have.length(2);
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
			stalk.run(db, function () {
				db.Chef.data.should.have.length(3);
				cb();
			});
		});

		it('Should have 2 ACTIVE and 1 NOACTIVE', function () {
			var active = 0;
			var noactive = 0;

			db.Chef.data.forEach(function (chef){
				if (chef.status === 'ACTIVE') {
					active += 1;
				} else if (chef.status == 'NOACTIVE') {
					noactive += 1;
				}
			});
			active.should.equal(2);
			noactive.should.equal(1);
		});

		it('Should have a third activity', function () {
			db.Activity.data.should.have.length(3);
		});

		it('Should have a third activity with 0 Added & 1 removed', function () {
			db.Activity.data.should.have.length(3);
			db.Activity.data[2].chefsAdded.should.have.length(0);
			db.Activity.data[2].chefsRemoved.should.have.length(1);
		});

		it('Should "Michelle" to be the removed chef', function () {
			var chef = db.Activity.data[2].chefsRemoved[0];
			chef.name.should.equal('Michelle');
		});

		after(function () {
			nock.cleanAll();
		});
	});

});
