/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 **/

const Joi = require('@hapi/joi')

module.exports = Joi.object({
  id: Joi.string().min(1).max(Number.MAX_SAFE_INTEGER),
  created_by: Joi.number().required().error(new Error('Creator is required')),
  description: Joi.string(),
  name: Joi.string().required().error(new Error('Name is required.')),
  environments: Joi.array().items(
    Joi.object({
      code: Joi.string().required(),
      criteria: Joi.array().items(
        Joi.object({
          property: Joi.string(),
          values: Joi.array()
        })
      )
    })
  ).required().error(new Error('Environments must be specified.')),
  criteria: Joi.array().items(
    Joi.object({
      property: Joi.string().required().error(new Error('Criterion property must be specified.')),
      condition: Joi.string().required().error(new Error('Criterion condition be specified.')),
      evaluation: Joi.boolean().required().error(new Error('Criterion value must be specified.'))
    })
  ).required().not().empty().error(new Error('Criteria must be specified')),
  tenant_id: Joi.number()
})
