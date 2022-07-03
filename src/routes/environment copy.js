/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const router = require('express').Router()
const environmentService = require('../services/environment')

try {
  router
    .post('/', async (request, __, next) => {
      request.payload = await environmentService.createRecord(request, next)
      next()
    })
    .get('/', async (request, __, next) => {
      request.payload = await environmentService.readRecordsByFilter(request, next)
      next()
    })
    .get('/:id', async (request, __, next) => {
      request.payload = await environmentService.readRecordById(request, next)
      next()
    })
    .get('/search/:fields', async (request, __, next) => {
      request.payload = await environmentService.readRecordsByWildcard(request, next)
      next()
    })
    .put('/:id', async (request, __, next) => {
      request.payload = await environmentService.updateRecordById(request, next)
      next()
    })
    .put('/', async (request, __, next) => {
      request.payload = await environmentService.updateRecords(request, next)
      next()
    })
    .delete('/:id', async (request, __, next) => {
      request.payload = await environmentService.deleteRecordById(request, next)
      next()
    })
    .delete('/', async (request, __, next) => {
      request.payload = await environmentService.deleteRecords(request, next)
      next()
    })
} catch (e) {
  console.log(`[Route Error] /environments: ${e.message}`)
} finally {
  module.exports = router
}
