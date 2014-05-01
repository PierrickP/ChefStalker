var nodemailer = require('nodemailer'),
swig  = require('swig'),
_ = require('lodash');

module.exports = function (db, conf) {
    var transaction;

    if (conf.mail_type == 'SMTP') {
        transaction = nodemailer.createTransport('SMTP', {
            host: 'smtp.mandrillapp.com',
            secureConnection: true,
            port: 587,
            auth: {
                user: conf.mail_user,
                pass: conf.mail_pass
            }
        });
    } else {
        transaction = nodemailer.createTransport('stub', {error: false});
    }

    return {
        sendNewActivity: function (activity, cb) {
            cb = (cb) ? cb : function () {};

            db.Stalkers.find({}, function (err, stalkers) {
                var bcc = _.pluck(stalkers, 'email');
                var html = swig.compileFile(__dirname + '/views/newActivityMail.html')(activity);

                var mailOptions = {
                    bcc: bcc.join(','),
                    subject: 'New Activity on Chef Stalker',
                    generateTextFromHTML: true,
                    html: html
                };
                transaction.sendMail(mailOptions, function (err, mail) {
                    cb(err, mail, html);
                });
            });
        }
    };
};

