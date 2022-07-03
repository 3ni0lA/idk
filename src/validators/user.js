/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 **/

const Joi = require('@hapi/joi')

module.exports = Joi.object({
  id: Joi.string().min(1).max(Number.MAX_SAFE_INTEGER),
  email_address: Joi.string().email().required().error(new Error('Email address is required.')),
  first_name: Joi.string().required().error(new Error('First name is required.')),
  last_name: Joi.string().required().error(new Error('Last name is required.')),
  password: Joi.string().required().error(new Error('Password is required.')),
  role: Joi.number().required().error(new Error('Role is required.'))
})
