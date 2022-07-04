/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 */
const nodemailer = require('nodemailer')
const {
  gm_client_uri,
  mail_host: MAIL_HOST,
  mail_port: MAIL_PORT,
  MAIL_PASS,
  MAIL_USER
} = require('../../config')

const configureTransport = () => {
  const config = {
    pool: true,
    host: MAIL_HOST,
    port: MAIL_PORT,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  }

  return nodemailer.createTransport(config)
}

const configureMessage = (recipient, value, type) => {
  let subject = ''; let html = ''

  switch (type) {
    case 'activation':
      subject = 'Flagly: Account Activation'
      html = `
        <p> Kindly click the link to activate your account.<p>
        <br/>
        <p><a href=${gm_client_uri}/activation/${value}>Activate Account</a></p>
      `
      break
    case 'contact_us':
      subject = `Flagly : [${value.firstname}] ${value.subject || 'New Enquiry'}`
      html = `
        <p> Sender: ${value.firstname} ${value.lastname} </p>
        <p> Email Adress: ${value.email} </p>
        <p>${value.body}</p>
      `
      break
    case 'mailbox':
      subject = 'Flagly: Email Verification'
      html = `
        <p> Here's your verification code.<p>
        <h2>${value}</h2>
      `
      break
    case 'invitation':
      subject = 'Flagly: User invitation'
      html = `
        <p>Hello ${value.first_name},</p> 
        <br/>
        <p>You have been invited to ${value.name}. Log in the following details:</p>
        <p> Kindly click the link to activate your account: <a href=${gm_client_uri}/acceptance/${value.tenant_id}/${value.user_id}>Accept Invitation</a><p>
        <br/>
        <p> Email address: ${value.email_address}</p>
        <p> Password: ${value.password} </p>
        <p style="color: red;">Please change your password.</p>
      `
      break
    case 'recovery':
      subject = 'Flagly: Account Recovery'
      html = `
        <p> Kindly click the link to recover your account.<p>
        <br/>
        <p><a href=${gm_client_uri}/password/reset/${value}>Recover Account</a></p>
      `
      break
    default:
      throw new Error(`MAILING ERROR: incorrect message type: ${type}`)
  }

  const sender = `${MAIL_USER}@Flagly.com`
  return {
    subject,
    html,
    to: recipient,
    from: `"Flagly" <${sender}>`,
    sender: `"Flagly" <${sender}>`,
    replyTo: `"Flagly" <${sender}>`
  }
}

module.exports = {
  sendEmail: async (recipient, value, type) => {
    const transport = configureTransport()
    const message_config = configureMessage(recipient, value, type)
    const response = await transport.sendMail(message_config)
    const { messageId } = response
    return !!messageId
  }
}
