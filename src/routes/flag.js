/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const router = require('express').Router()
const flagService = require('../services/flag')

try {
  router
    .post('/', async (request, __, next) => {
      request.payload = await flagService.createRecord(request, next)
      next()
    })
    .get('/', async (request, __, next) => {
      request.payload = await flagService.readRecordsByFilter(request, next)
      next()
    })
    .get('/:id', async (request, __, next) => {
      request.payload = await flagService.readRecordById(request, next)
      next()
    })
    .get('/search/:fields', async (request, __, next) => {
      request.payload = await flagService.readRecordsByWildcard(request, next)
      next()
    })
    .put('/:id', async (request, __, next) => {
      request.payload = await flagService.updateRecordById(request, next)
      next()
    })
    .put('/', async (request, __, next) => {
      request.payload = await flagService.updateRecords(request, next)
      next()
    })
    .delete('/:id', async (request, __, next) => {
      request.payload = await flagService.deleteRecordById(request, next)
      next()
    })
    .delete('/', async (request, __, next) => {
      request.payload = await flagService.deleteRecords(request, next)
      next()
    })
} catch (e) {
  console.log(`[Route Error] /flags: ${e.message}`)
} finally {
  module.exports = router
}
