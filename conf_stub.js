module.exports = {
	port: process.env.PORT || 3000,
	url: 'http://localhost/chef',
	connect_url: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/chefStalker'
};
