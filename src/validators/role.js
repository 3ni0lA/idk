/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const Joi = require('@hapi/joi')

module.exports = Joi.object({
  id: Joi.string().min(1).max(Number.MAX_SAFE_INTEGER),
  created_by: Joi.number().required().error(new Error('Creator ID is required.')),
  description: Joi.string(),
  name: Joi.string().required().error(new Error('Name is required.')),
  environments: Joi.array().items(
    Joi.object({
      code: Joi.string().required().error(new Error('Environment code is required.')),
      label: Joi.string(),
      value: Joi.string().required().error(new Error('Value is required for environment.'))
    })
  ),
  tenant_id: Joi.number()
})
