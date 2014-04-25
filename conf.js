module.exports = {
	port: process.env.PORT || 3000,
	url: process.env.STALK_URL || 'http://localhost/chef',
	connect_url: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/chefStalker'
};
