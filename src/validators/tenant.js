/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 **/

const Joi = require('@hapi/joi')

module.exports = Joi.object({
  id: Joi.string().min(1).max(Number.MAX_SAFE_INTEGER),
  name: Joi.string().required().error(new Error('Name is required.')),
  email_address: Joi.string().email().required().error(new Error('Email address is required.')),
  password: Joi.string().required().error(new Error('Password is required.'))
})
