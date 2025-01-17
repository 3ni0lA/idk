/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 **/

const Joi = require('@hapi/joi')

module.exports = Joi.object({
  id: Joi.string().min(1).max(Number.MAX_SAFE_INTEGER),
  name: Joi.string().required().error(new Error('Name is required.')),
  code: Joi.string(),
  created_by: Joi.number().required().error(new Error('Creator ID is required.')),
  description: Joi.string(),
  tenant_id: Joi.number()
})
