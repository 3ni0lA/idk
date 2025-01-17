/** */
require('dotenv').config()
const {
  NODE_ENV,
  DB_PASS,
  DB_USER,
  DEFAULT_TOKEN,
  JWT_ISSUER,
  JWT_SECRET,
  PEOPLE_MAIL_USER: MAIL_USER,
  PEOPLE_MAIL_PASS: MAIL_PASS
} = process.env

const config = {
  development: {
    app_db_uri: 'mongodb://127.0.0.1:27017/flagly_control',
    app_port: 5100,
    gm_client_uri: 'http://127.0.0.1:5000',

    mail_host: 'mail.go-mailer.net',
    mail_port: 25
  },
  production: {
    app_db_uri: `mongodb+srv://flaglyapi:266Yq95Povew3x2v@apidatabase.kx1uswj.mongodb.net/?retryWrites=true&w=majority&appName=apidatabase`,
    app_port: 5100,
    gm_client_uri: 'https://app.go-flags.com',

    mail_host: 'mail.go-mailer.net',
    mail_port: 25
  }
}

module.exports = {
  DEFAULT_TOKEN,
  JWT_ISSUER,
  JWT_SECRET,
  MAIL_USER,
  MAIL_PASS,
  NODE_ENV,
  ...process.env,
  ...config[NODE_ENV || 'development']
}
