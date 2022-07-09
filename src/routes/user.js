/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const router = require('express').Router()
const userService = require('../services/user')

try {
  router
    .post('/', async (request, __, next) => {
      request.payload = await userService.createRecord(request, next)
      next()
    })
    .post('/invite', async (request, __, next) => {
      request.payload = await userService.invite(request, next)
      next()
    })
    .get('/', async (request, __, next) => {
      request.payload = await userService.readRecordsByFilter(request, next)
      next()
    })
    .get('/:id', async (request, __, next) => {
      request.payload = await userService.readRecordById(request, next)
      next()
    })
    .get('/search/:fields', async (request, __, next) => {
      request.payload = await userService.readRecordsByWildcard(request, next)
      next()
    })
    .put('/:id', async (request, __, next) => {
      request.payload = await userService.updateRecordById(request, next)
      next()
    })
    .put('/', async (request, __, next) => {
      request.payload = await userService.updateRecords(request, next)
      next()
    })
    .delete('/:id', async (request, __, next) => {
      request.payload = await userService.deleteRecordById(request, next)
      next()
    })
    .delete('/', async (request, __, next) => {
      request.payload = await userService.remove(request, next)
      next()
    })
} catch (e) {
  console.log(`[Route Error] /users: ${e.message}`)
} finally {
  module.exports = router
}
