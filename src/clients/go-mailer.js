/** */
const axios = require('axios')
const { GM_MAILING_URI, GM_API_KEY } = require('../../config')
const { app_logger } = require('../utilities/logger')
const logger = app_logger('GoMailer Client')

module.exports = {
  dispatchTransactional: async (data) => {
    try {
      const { data: { error, payload } } = await axios.post(`${GM_MAILING_URI}/api/v1/transactionals/dispatch`, {
        ...data
      }, {
        headers: {
          Authorization: `Bearer ${GM_API_KEY}`
        }
      })

      console.log(error, payload)
    } catch (e) {
      logger.error(e.message, 'dispatchTransactional')
    }
  }
}
