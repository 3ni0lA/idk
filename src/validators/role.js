/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const Joi = require('@hapi/joi')

module.exports = Joi.object({
  id: Joi.string().min(1).max(Number.MAX_SAFE_INTEGER),
  name: Joi.string().required().error(new Error('Name is required.')),
  environments: Joi.array().items(
    Joi.object({
      code: Joi.string().required().error(new Error('Environment code is required.')),
      value: Joi.string().required().error(new Error('Value is required for environment.'))
    })
  )
})
