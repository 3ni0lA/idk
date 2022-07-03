/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const router = require('express').Router()
const roleService = require('../services/role')

try {
  router
    .post('/', async (request, __, next) => {
      request.payload = await roleService.createRecord(request, next)
      next()
    })
    .get('/', async (request, __, next) => {
      request.payload = await roleService.readRecordsByFilter(request, next)
      next()
    })
    .get('/:id', async (request, __, next) => {
      request.payload = await roleService.readRecordById(request, next)
      next()
    })
    .get('/search/:fields', async (request, __, next) => {
      request.payload = await roleService.readRecordsByWildcard(request, next)
      next()
    })
    .put('/:id', async (request, __, next) => {
      request.payload = await roleService.updateRecordById(request, next)
      next()
    })
    .put('/', async (request, __, next) => {
      request.payload = await roleService.updateRecords(request, next)
      next()
    })
    .delete('/:id', async (request, __, next) => {
      request.payload = await roleService.deleteRecordById(request, next)
      next()
    })
    .delete('/', async (request, __, next) => {
      request.payload = await roleService.deleteRecords(request, next)
      next()
    })
} catch (e) {
  console.log(`[Route Error] /roles: ${e.message}`)
} finally {
  module.exports = router
}
