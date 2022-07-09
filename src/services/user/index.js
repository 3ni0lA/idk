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

const { buildQuery, buildWildcardOptions } = require('../../utilities/query')
const { sendEmail } = require('../_email')
const { encryptPassword } = require('../../utilities/encryption')

class UserService extends RootService {
  constructor (user_controller) {
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
      const { params: { id }, tenant_id } = request
      if (!id) return next(this.processFailedResponse('Invalid ID supplied.'))

      const result = await this.user_controller.readRecords({ id, tenant_id, is_active: true })
      return this.processSingleRead(result.data[0])
    } catch (e) {
      logger.error(e.message, 'readRecordById')
      const err = this.processFailedResponse(e.message, 500)
      return next(err)
    }
  }

  async readRecordsByFilter (request, next) {
    try {
      const { query, tenant_id } = request

      const result = await this.handleDatabaseRead(this.user_controller, query, {
        'tenants.id': tenant_id
      })
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

  //
  async invite (request, next) {
    try {
      const {
        body: { email_address, first_name, last_name, name, password, role, tenant_id }
      } = request

      const email_validation = this.validateEmail(email_address)
      const validated_email = email_validation.message
      if (!email_validation.is_valid) {
        return this.processFailedResponse(email_validation.message, 400)
      }

      let user_id = 0
      let is_user_exists = false
      let is_successful = false
      const { data: users } = await this.user_controller.readRecords({ email_address })

      if (users && users[0]) {
        is_user_exists = true
        user_id = users[0]._id
        const user_tenancy = users[0].tenants.find((tenant) => tenant.id === Number(tenant_id))

        if (user_tenancy) {
          if (user_tenancy.status !== 'invited') {
            return this.processFailedResponse('Unprocessable Entity.', 422)
          }

          is_successful = true
        } else {
          const { acknowledged, modifiedCount } = await this.user_controller.updateRecords(
            { _id: user_id },
            {
              $addToSet: { tenants: { id: tenant_id } }
            }
          )
          is_successful = !!acknowledged && !!modifiedCount
        }
      } else {
        const encrypted_password = await encryptPassword(password)
        const { _id, id } = await this.user_controller.createRecord({
          email_address,
          first_name,
          last_name,
          is_active: true,
          password: encrypted_password,
          role,
          tenants: [
            {
              id: tenant_id
            }
          ]
        })
        user_id = _id
        is_successful = !!_id && !!id
      }

      if (is_successful) {
        await sendEmail(
          validated_email,
          {
            email_address,
            first_name,
            last_name,
            name,
            tenant_id,
            user_id,
            password: is_user_exists ? '******' : password
          },
          'invitation'
        )
        return this.processSuccessfulResponse(`Success. Invitation sent to ${validated_email}`)
      }

      return this.processFailedResponse('User invitation failed.')
    } catch (e) {
      logger.error(e.message, 'invite')
      const err = this.processFailedResponse(e.message, 500)
      next(err)
    }
  }

  async remove (request, next) {
    try {
      const {
        body: { user_id, tenant_id }
      } = request

      if (!(user_id && tenant_id)) {
        return this.processFailedResponse('Unprocessable Entity.', 422)
      }

      const { data: users } = await this.user_controller.readRecords({ id: user_id })

      if (users && users[0]) {
        const user_tenancy = users[0].tenants.find((tenant) => tenant.id === Number(tenant_id))

        if (user_tenancy) {
          const { acknowledged, modifiedCount } = await this.user_controller.updateRecords(
            { id: user_id },
            {
              $set: {
                'tenants.$[element].status': 'removed'
              }
            },
            {
              multi: true,
              arrayFilters: [
                {
                  'element.id': { $in: [tenant_id] },
                  'element.status': 'accepted'
                }
              ]
            }
          )
          if (acknowledged && modifiedCount) {
            return this.processSuccessfulResponse('User removed successfully')
          }
          return this.processFailedResponse('Unprocessable Entity.', 422)
        }
      }

      return this.processFailedResponse('Unprocessable Entity.', 422)
    } catch (e) {
      logger.error(e.message, 'invite')
      const err = this.processFailedResponse(e.message, 500)
      next(err)
    }
  }
}

module.exports = new UserService(userController)
