module.exports = {
    port: process.env.PORT || 3000,
    url: process.env.STALK_URL || 'http://localhost/chef',
    host: process.env.MONGODB_HOST || "localhost:27017",
    username: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
    database: process.env.MONGODB_DATABASE || 'ChefStalk'
};
