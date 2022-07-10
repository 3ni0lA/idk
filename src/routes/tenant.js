/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const router = require('express').Router()
const tenantService = require('../services/tenant')

try {
  router
    .post('/', async (request, __, next) => {
      request.payload = await tenantService.createRecord(request, next)
      next()
    })
    .get('/', async (request, __, next) => {
      request.payload = await tenantService.readRecordsByFilter(request, next)
      next()
    })
    .get('/:id', async (request, __, next) => {
      request.payload = await tenantService.readRecordById(request, next)
      next()
    })
    .get('/search/:fields', async (request, __, next) => {
      request.payload = await tenantService.readRecordsByWildcard(request, next)
      next()
    })
    .put('/:id', async (request, __, next) => {
      request.payload = await tenantService.updateRecordById(request, next)
      next()
    })
    .put('/', async (request, __, next) => {
      request.payload = await tenantService.updateRecords(request, next)
      next()
    })
    .put('/:id/key', async (request, __, next) => {
      request.payload = await tenantService.generateAPIKey(request, next)
      next()
    })
    .delete('/:id', async (request, __, next) => {
      request.payload = await tenantService.deleteRecordById(request, next)
      next()
    })
    .delete('/', async (request, __, next) => {
      request.payload = await tenantService.deleteRecords(request, next)
      next()
    })
} catch (e) {
  console.log(`[Route Error] /tenants: ${e.message}`)
} finally {
  module.exports = router
}
