const RootService = require('../_root')
const Controller = require('../../controllers')
const flagController = new Controller('Flag')
const { app_logger } = require('../../utilities/logger')
const logger = app_logger('FlagService')

class FlagService extends RootService {
  constructor (flag_controller) {
    super()
    this.flag_controller = flag_controller
  }

  async checkFeaturePermission (request, next) {
    try {
      const { tenant_id, body: { environment, payload }, params: { name } } = request

      const { data } = await this.flag_controller.readRecords({ name, tenant_id })
      if (!data[0]) return this.processFailedResponse('No flags found.')

      const { criteria, environments: envs } = data[0]
      const env = envs.find((env) => env.code === environment)
      if (!env) return this.processFailedResponse('No flags found.')

      const { criteria: env_criteria } = env
      const values_by_property = env_criteria.reduce((sac, criterion) => ({ ...sac, [criterion.property]: criterion.values }), {})
      const condition_by_property = criteria.reduce((sac, criterion) => ({
        ...sac,
        [criterion.property]: { ...criterion, values: values_by_property[criterion.property] }
      }), {})

      // process permissions
      const permissions = []
      let is_permitted = false
      for (const key in condition_by_property) {
        if (!payload[key]) {
          permissions.push(false)
          break
        }

        let value = payload[key]

        value = value.toString()
        const { condition, evaluation, values } = condition_by_property[key]

        switch (condition) {
          case 'some':
          case 'none':
            if (typeof payload[key] !== 'string' && typeof payload[key] !== 'number') {
              return this.processFailedResponse(`Invalid criteria value: ${key} must be string or number`)
            }

            value = value.toString()
            break
          case 'greater':
          case 'less':
            if (isNaN(payload[key])) {
              return this.processFailedResponse(`Invalid criteria value: ${key} must be number`)
            }
            value = Number(value)
            break
          default:
            return this.processFailedResponse('Invalid condition')
        }

        switch (condition) {
          case 'some':
            permissions.push(values.includes(value) === evaluation)
            break
          case 'none':
            permissions.push(!values.includes(value) === evaluation)
            break
          case 'greater':
            permissions.push((value > Number(values[0])) === evaluation)
            break
          case 'less':
            permissions.push((value < Number(values[0])) === evaluation)
            break
        }
      }

      is_permitted = permissions.reduce((result, value) => (result && value), true)

      return this.processSuccessfulResponse({ is_permitted })
    } catch (e) {
      logger.error(e.message, 'checkFeaturePermission')
      const err = this.processFailedResponse(e.message, 500)
      next(err)
    }
  }
}

module.exports = new FlagService(flagController)
