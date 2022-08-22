/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 **/
//
const _RootService = require('../_root')
const Controller = require('../../controllers')
const { CREATED } = require('../../events/constants/tenant')
const tenantController = new Controller('Tenant')
const userController = new Controller('User')
const { app_logger } = require('../../utilities/logger')
const logger = app_logger('GuestService')

const { checkPasswordMatch, encryptPassword, generateAuthenticationToken, validatePassword } = require('../../utilities/encryption')
const { sendEmail } = require('../_email')
const { generateAPIKey } = require('../../utilities/generic')

class GuestService extends _RootService {
  constructor (tenant_controller, user_controller) {
    super()

    this.tenant_controller = tenant_controller
    this.user_controller = user_controller
  }

  async activateRecord (request, next) {
    try {
      const { key } = request.params
      if (!key) {
        return this.processFailedResponse('Invalid activation key', 400)
      }

      const user_updation = await this.user_controller.updateRecords({ _id: key }, { is_active: true })
      const { acknowledged, modifiedCount } = user_updation
      if (acknowledged && modifiedCount) {
        return this.processSuccessfulResponse('Account Activation successful.')
      }

      if (acknowledged && !modifiedCount) {
        return this.processSuccessfulResponse('Account is already activated.')
      }
      return this.processFailedResponse('Update failed', 500)
    } catch (e) {
      logger.console(e.message, 'activateRecord')
      const err = this.processFailedResponse(e.message, 500)
      next(err)
    }
  }

  async acceptInvitation (request, next) {
    try {
      const { params: { tenant_id, user_id } } = request
      if (!tenant_id || !user_id) {
        return this.processFailedResponse('Invalid request', 400)
      }

      const user_updation = await this.user_controller.updateRecords({ _id: user_id },
        {
          $set: {
            'tenants.$[element].status': 'accepted'
          }
        },
        {
          multi: true,
          arrayFilters: [
            {
              'element.id': { $in: [tenant_id] },
              'element.status': 'invited'
            }
          ]
        })
      const { acknowledged, modifiedCount } = user_updation
      if (acknowledged && modifiedCount) {
        return this.processSuccessfulResponse('Acceptance successful.')
      }

      if (acknowledged && !modifiedCount) {
        return this.processSuccessfulResponse('Already accepted.')
      }
      return this.processFailedResponse('Acceptance failed', 500)
    } catch (e) {
      logger.console(e.message, 'acceptInvitation')
      const err = this.processFailedResponse(e.message, 500)
      next(err)
    }
  }

  async contactUs (request, next) {
    try {
      const { firstname, lastname, email, subject, body } = request.body
      if (!firstname || !lastname || !email || !subject || !body) {
        return this.processFailedResponse('Invalid request')
      }

      const email_validation = this.validateEmail(email)
      if (!email_validation.is_valid) {
        return this.processFailedResponse(email_validation.message, 400)
      }

      await sendEmail('info@go-mailer.com', request.body, 'contact_us')
      return this.processSuccessfulResponse("Thank you, we'll reach back shortly.")
    } catch (e) {
      logger.console(e.message, 'contactUs')
      const err = this.processFailedResponse(`contactUs: ${e.message}`, 500)
      next(err)
    }
  }

  async createRecord (request, next) {
    try {
      const {
        body: { email_address, first_name, last_name, name, password }
      } = request

      const email_validation = this.validateEmail(email_address)
      if (!email_validation.is_valid) {
        return this.processFailedResponse(email_validation.message, 400)
      }

      const validated_email = email_validation.message
      const user_record = await this.user_controller.readRecords({ email_address })
      if (user_record && user_record.data.length) {
        return this.processFailedResponse('Email address already in use.')
      }

      const password_validation = validatePassword(password)
      if (!password_validation.is_valid) {
        return this.processFailedResponse(password_validation.message, 400)
      }

      const encrypted_password = await encryptPassword(password_validation.message)
      const api_key = generateAPIKey()
      const created_record = await this.tenant_controller.createRecord({ name, api_key })
      const { _id, id: tenant_id } = created_record
      if (!created_record || !_id) {
        return this.processFailedResponse('Account creation failed.')
      }

      const { _id: user_id } = await this.user_controller.createRecord({
        email_address,
        first_name,
        last_name,
        password: encrypted_password,
        is_super_admin: true,
        tenants: [
          {
            id: tenant_id,
            status: 'accepted'
          }
        ]
      })

      await sendEmail(validated_email, user_id, 'activation')
      this.processCreationResult({ tenant_id, user_id }, CREATED)
      return this.processSuccessfulResponse(`Success. Activation link sent to ${validated_email}`)
    } catch (e) {
      logger.console(e.message, 'createRecord')
      const err = this.processFailedResponse(e.message, 500)
      next(err)
    }
  }

  async initiate_password_reset (request, next) {
    try {
      const { email } = request.body

      if (!email) {
        return this.processFailedResponse('Email not specified', 400)
      }

      const email_validation = this.validateEmail(email)
      if (!email_validation.is_valid) {
        return this.processFailedResponse(email_validation.message, 400)
      }
      const validated_email = email_validation.message

      const user_record = await this.tenant_controller.readRecords({
        email: validated_email,
        is_active: true
      })
      if (!user_record || !user_record.data.length) {
        return this.processFailedResponse('Account not found.', 400)
      }

      const expires_at = Date.now() + 600000
      let recovery_id = ''
      const tenant_id = user_record.data[0].id
      let recovery_record = await this.account_recovery_controller.readRecords({ tenant_id })
      if (recovery_record && recovery_record.data.length) {
        // If user has attempted to recover password previously
        recovery_id = recovery_record.data[0]._id
        // update new expiry time
        await this.account_recovery_controller.update_records({ tenant_id }, { expires_at })
      } else {
        // If this is the user's first recovery attempt
        recovery_record = await this.account_recovery_controller.createRecord({
          tenant_id,
          expires_at
        })

        recovery_id = recovery_record._id
      }

      await sendEmail(validated_email, recovery_id, 'recovery')
      return this.processSuccessfulResponse(`Recovery details sent to ${validated_email}.`)
    } catch (e) {
      logger.console(e.message, 'initiate_password_reset')
      const err = this.processFailedResponse(e.message, 500)
      next(err)
    }
  }

  async login (request, next) {
    try {
      const {
        body: { email_address, password }
      } = request

      const email_validation = this.validateEmail(email_address)
      if (!email_validation.is_valid) {
        return this.processFailedResponse(email_validation.message, 400)
      }

      const password_validation = validatePassword(password)
      if (!password_validation.is_valid) {
        return this.processFailedResponse(password_validation.message, 400)
      }

      const validated_email = email_validation.message
      const validated_password = password_validation.message

      const result = await this.user_controller.readRecords({
        email_address: validated_email
      })

      if (result && result.data.length) {
        const user_record = result.data[0]
        if (!user_record.is_active) {
          await sendEmail(validated_email, user_record._id, 'activation')
          return this.processFailedResponse('Account inactive. Activation link resent!')
        }

        const password_is_correct = await checkPasswordMatch(validated_password, user_record.password)
        if (password_is_correct) {
          const authentication_token = await generateAuthenticationToken({
            ...user_record
          })
          return this.processSuccessfulResponse({
            ...user_record,
            token: authentication_token
          })
        }
      }

      return this.processFailedResponse('Incorrect email or password.', 400)
    } catch (e) {
      logger.console(e.message, 'login')
      const err = this.processFailedResponse(e.message, 500)
      next(err)
    }
  }

  async reset_password (request, next) {
    try {
      const {
        body: { recovery_id, password }
      } = request

      const recovery_record = await this.account_recovery_controller.readRecords({
        _id: recovery_id,
        expires_at: { $gte: Date.now() }
      })

      if (!recovery_record || !recovery_record.data.length) {
        return this.processFailedResponse('Account recovery key is expired.', 400)
      }

      const id = recovery_record.data[0].tenant_id
      const encrypted_password = await encryptPassword(password)
      const user_updation = await this.tenant_controller.update_records({ id }, { password: encrypted_password })
      const { ok, nModified } = user_updation

      if (user_updation && ok && nModified) {
        this.account_recovery_controller.update_records({ _id: recovery_id }, { expires_at: Date.now() - 86400000 })
        return this.processSuccessfulResponse('Password reset successfully.')
      }

      if (user_updation && ok && !nModified) {
        return this.processSuccessfulResponse('Password cannot be the current password.', 210)
      }

      return this.processFailedResponse('Failed to reset password', 500)
    } catch (e) {
      logger.console(e.message, 'reset_password')
      const err = this.processFailedResponse(e.message, 500)
      next(err)
    }
  }

  async resend_activation_key (request, next) {
    try {
      const { email } = request.params
      if (!email) return this.processFailedResponse('Invalid request', 400)

      const email_validation = this.validateEmail(email)
      if (!email_validation.is_valid) {
        return this.processFailedResponse(email_validation.message, 400)
      }

      const validated_email = email_validation.message
      const user_record = await this.tenant_controller.readRecords({
        email: validated_email
      })
      if (!user_record || !user_record.data.length) {
        return this.processFailedResponse('Invalid request', 400)
      }

      const { _id } = user_record.data[0]
      await sendEmail(validated_email, _id, 'activation')
      return this.processSuccessfulResponse(`Success. Activation link sent to ${validated_email}`)
    } catch (e) {
      logger.console(e.message, 'resend_activation_key')
      const err = this.processFailedResponse(e.message, 500)
      next(err)
    }
  }
}

module.exports = new GuestService(tenantController, userController)
