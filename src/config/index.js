const { SMTP_SERVICE, SMTP_HOST, SMTP_USER, SMTP_PASSWORD } = process.env;

module.exports = {
  mailerOptions: {
    service: SMTP_SERVICE,
    host: SMTP_HOST,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  },
};
