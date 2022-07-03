const appEvent = require('../_config')
const { CREATED } = require('../constants/tenant')

appEvent.on(CREATED, async (data) => {
  console.log(data)
})
