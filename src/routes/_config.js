/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 **/

const router = require('express').Router()
const { handle404, handleError, setupRequest, processResponse } = require('../middlewares/http')
const { authenticate_user } = require('../middlewares/auth')

/** Route Handlers */
const sample_route_handler = require('./sample')
const environment_route_handler = require('./environment')
const flag_route_handler = require('./flag')
const guest_route_handler = require('./guest')
const role_route_handler = require('./role')
const tenant_route_handler = require('./tenant')
const user_route_handler = require('./user')

/** Cross Origin Handling */
router.use(setupRequest)
router.use('/guests', guest_route_handler)
router.use('/environments', authenticate_user, environment_route_handler)
router.use('/flags', authenticate_user, flag_route_handler)
router.use('/roles', authenticate_user, role_route_handler)
router.use('/tenants', authenticate_user, tenant_route_handler)
router.use('/users', authenticate_user, user_route_handler)
router.use('/samples', sample_route_handler)
router.use(processResponse)

/** Static Routes */
router.use('/image/:image_name', (request, response) => {})

router.use(handle404)
router.use(handleError)

module.exports = router
