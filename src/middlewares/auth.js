/**
 * User Authentication Middleware
 */
const jwt = require('jsonwebtoken')
// const axios = require('axios').default
const { app_logger } = require('../utilities/logger')
const RootService = require('../services/_root')
const Controller = require('../controllers')
const tenantController = new Controller('Tenant')
const rootService = new RootService()
const {
  DEFAULT_TOKEN,
  JWT_ISSUER,
  JWT_SECRET
  // gm_iam_uri
} = require('../../config.js')

const logger = app_logger('Authentication Middleware')
const authenticate_api_key = async (request, __, next) => {
  try {
    const { authorization } = request.headers
    if (!authorization) {
      return next(rootService.processFailedResponse('Unauthorized', 403))
    }

    const [, api_key] = authorization.split(' ')
    if (!api_key) {
      return next(rootService.processFailedResponse('Unauthorized', 403))
    }

    const { data } = await tenantController.readRecords({ api_key })

    if (!data || !data[0]) {
      return next(rootService.processFailedResponse('Unauthorized', 403))
    }

    request.tenant_id = data[0].id
    next()
  } catch (e) {
    logger.error(e.message, 'authenticate_api_key')
    next(rootService.processFailedResponse('Unauthorized', 403))
  }
}

// const authenticate_param_api_key = async (request, __, next) => {
//   try {
//     const { api_key } = request.params
//     if (!api_key) {
//       return next(rootService.processFailedResponse('Unauthorized', 403))
//     }

//     const { error, payload } = (
//       await axios.get(`${gm_iam_uri}/verify/${api_key}`)
//     ).data
//     if (error) {
//       return next(rootService.processFailedResponse('Unauthorized', 403))
//     }

//     request.tenant_id = payload.org_id
//     next()
//   } catch (e) {
//     logger.error(e.message, 'authenticate_param_api_key')
//     next(rootService.processFailedResponse('Unauthorized', 403))
//   }
// }

const authenticate_user = async (request, __, next) => {
  try {
    const { authorization } = request.headers
    const {
      body: { tenant_id: body_tenant_id },
      params: { tenant_id: params_tenant_id },
      query: { tenant_id: query_tenant_id }
    } = request

    let tenant_id = 0
    if (query_tenant_id) tenant_id = query_tenant_id
    if (params_tenant_id) tenant_id = params_tenant_id
    if (body_tenant_id) tenant_id = body_tenant_id

    if (!authorization) {
      return next(rootService.processFailedResponse('Unauthorized', 403))
    }

    const [, token] = authorization.split(' ')
    if (!token) {
      return next(rootService.processFailedResponse('Unauthorized', 403))
    }

    if (token === DEFAULT_TOKEN) {
      request.tenant_id = request.body && request.body.tenant_id ? request.body.tenant_id : { $exists: true }
      return next()
    }

    const verified_data = await jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER
    })

    const { id: user_id, tenants, is_admin } = verified_data
    const is_valid_tenant_id = tenants.find((tenant) => tenant.id === Number(tenant_id))
    if (!tenant_id || isNaN(tenant_id) || !is_valid_tenant_id) {
      return next(rootService.processFailedResponse('Unauthorized', 403))
    }

    request.is_super_admin = verified_data.is_superadmin
    request.tenant_id = is_admin ? { $exists: true } : tenant_id
    request.user_id = user_id
    next()
  } catch (e) {
    logger.error(e.message, 'authenticate_user')
    next(rootService.processFailedResponse('Unauthorized', 403))
  }
}

module.exports = {
  authenticate_api_key,
  // authenticate_param_api_key,
  authenticate_user
}
