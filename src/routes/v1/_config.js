/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const router = require('express').Router()
const flags = require('./flag')
try {
  router.use('/flags', flags)
} catch (e) {
  console.log(`[Route Error] /api/v1/flags: ${e.message}`)
} finally {
  module.exports = router
}
