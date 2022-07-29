/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const router = require('express').Router()
const guestService = require('../services/guest')

try {
  router
    .post('/register', async (request, __, next) => {
      request.payload = await guestService.createRecord(request, next)
      next()
    })
    .post('/login', async (request, __, next) => {
      request.payload = await guestService.login(request, next)
      next()
    })
    .get('/acceptance/:tenant_id/:user_id', async (request, __, next) => {
      request.payload = await guestService.acceptInvitation(request, next)
      next()
    })
    .get('/activation/:key', async (request, __, next) => {
      request.payload = await guestService.activateRecord(request, next)
      next()
    })
    .get('/:id', async (request, __, next) => {
      request.payload = await guestService.readRecordById(request, next)
      next()
    })
    .get('/search/:fields', async (request, __, next) => {
      request.payload = await guestService.readRecordsByWildcard(request, next)
      next()
    })
    .put('/:id', async (request, __, next) => {
      request.payload = await guestService.updateRecordById(request, next)
      next()
    })
    .put('/', async (request, __, next) => {
      request.payload = await guestService.updateRecords(request, next)
      next()
    })
    .delete('/:id', async (request, __, next) => {
      request.payload = await guestService.deleteRecordById(request, next)
      next()
    })
    .delete('/', async (request, __, next) => {
      request.payload = await guestService.deleteRecords(request, next)
      next()
    })
} catch (e) {
  console.log(`[Route Error] /guests: ${e.message}`)
} finally {
  module.exports = router
}
