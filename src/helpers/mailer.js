// Import modules
const mailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const fs = require('fs');
const mustache = require('mustache');
const path = require('path');
const config = require('../config');

exports.verifMail = (receiver, OTP, subject, message) => {
  const template = fs.readFileSync(
    path.resolve(__dirname, '../services/mailTemplates/activate.html'),
    'utf-8'
  );

  const transporter = mailer.createTransport(
    smtpTransport(config.mailerOptions)
  );

  const mailOptions = {
    from: config.mailerOptions.auth.user,
    to: receiver,
    subject,
    html: mustache.render(template, { OTP, subject, message }),
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      throw err;
    }
    console.log('Email sent: ', info);
  });
};
