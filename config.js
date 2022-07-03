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
  // staging: {
  //   app_db_uri: '',
  //   app_port: 5100,
  //   gm_client_uri: "https://app.flagly.dev",

  //   mail_host: 'mail.go-mailer.net',
  //   mail_port: 25
  // },
  production: {
    app_db_uri: `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.hf2ex.mongodb.net/flagly_control`,
    app_port: 5100,
    gm_client_uri: 'https://flagly.go-mailer.com',

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
  ...config[NODE_ENV || 'development']
}
