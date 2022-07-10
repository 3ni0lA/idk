/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const router = require('express').Router()
const flagService = require('../../services/api/flags')

try {
  router
    .post('/:name', async (request, __, next) => {
      request.payload = await flagService.checkFeaturePermission(request, next)
      next()
    })
} catch (e) {
  console.log(`[Route Error] /api/v1/flags: ${e.message}`)
} finally {
  module.exports = router
}
