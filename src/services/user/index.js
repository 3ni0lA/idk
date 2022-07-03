/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/
//
const RootService = require('../_root')
const Controller = require('../../controllers')
const userController = new Controller('User')
const userSchema = require('../../validators/user')
const { app_logger } = require('../../utilities/logger')
const logger = app_logger('UserService')

const {
  buildQuery,
  buildWildcardOptions
} = require('../../utilities/query')

class UserService extends RootService {
  constructor (
    user_controller
  ) {
    /** */
    super()

    /** */
    this.user_controller = user_controller
  }

  async createRecord (request, next) {
    try {
      const { body } = request
      const { error } = userSchema.validate(body)

      if (error) throw new Error(error)

      delete body.id
      const result = await this.user_controller.createRecord({ ...body })
      return this.processSingleRead(result)
    } catch (e) {
      logger.error(e.message, 'createRecord')
      const err = this.processFailedResponse(e.message, 500)
      next(err)
    }
  }

  async readRecordById (request, next) {
    try {
      const { id } = request.params
      if (!id) return next(this.processFailedResponse('Invalid ID supplied.'))

      const result = await this.user_controller.readRecords({ id, is_active: true })
      return this.processSingleRead(result.data[0])
    } catch (e) {
      logger.error(e.message, 'readRecordById')
      const err = this.processFailedResponse(e.message, 500)
      return next(err)
    }
  }

  async readRecordsByFilter (request, next) {
    try {
      const { query } = request

      const result = await this.handleDatabaseRead(this.user_controller, query)
      return this.processMultipleReadResults(result)
    } catch (e) {
      logger.error(e.message, 'readRecordsByFilter')
      const err = this.processFailedResponse(e.message, 500)
      next(err)
    }
  }

  async readRecordsByWildcard (request, next) {
    try {
      const { params, query } = request

      if (!params.fields) {
        return next(this.processFailedResponse('Invalid request', 400))
      }

      const wildcard_conditions = buildWildcardOptions(params.fields, query.keyword)
      delete query.keyword
      const result = await this.handleDatabaseRead(this.user_controller, query, wildcard_conditions)
      return this.processMultipleReadResults(result)
    } catch (e) {
      logger.error(e.message, 'readRecordsByWildcard')
      const err = this.processFailedResponse(e.message, 500)
      next(err)
    }
  }

  async updateRecordById (request, next) {
    try {
      const { id } = request.params
      const data = request.body

      if (!id) return next(this.processFailedResponse('Invalid ID supplied.'))

      const result = await this.user_controller.updateRecords({ id }, { ...data })
      return this.processUpdateResult(result)
    } catch (e) {
      logger.error(e.message, 'updateRecordById')
      const err = this.processFailedResponse(e.message, 500)
      next(err)
    }
  }

  async updateRecords (request, next) {
    try {
      const { options, data } = request.body
      const { seek_conditions } = buildQuery(options)

      const result = await this.user_controller.updateRecords({ ...seek_conditions }, { ...data })
      return this.processUpdateResult({ ...data, ...result })
    } catch (e) {
      logger.error(e.message, 'updateRecords')
      const err = this.processFailedResponse(e.message, 500)
      next(err)
    }
  }

  async deleteRecordById (request, next) {
    try {
      const { id } = request.params
      if (!id) return next(this.processFailedResponse('Invalid ID supplied.'))

      const result = await this.user_controller.deleteRecords({ id })
      return this.processDeleteResult(result)
    } catch (e) {
      logger.error(e.message, 'deleteRecordById')
      const err = this.processFailedResponse(e.message, 500)
      next(err)
    }
  }

  async deleteRecords (request, next) {
    try {
      const { options } = request.body
      const { seek_conditions } = buildQuery(options)

      const result = await this.user_controller.deleteRecords({ ...seek_conditions })
      return this.processDeleteResult({ ...result })
    } catch (e) {
      logger.error(e.message, 'deleteRecords')
      const err = this.processFailedResponse(e.message, 500)
      next(err)
    }
  }
}

module.exports = new UserService(userController)