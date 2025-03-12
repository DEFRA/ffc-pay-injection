require('log-timestamp')
require('./insights').setup()

const config = require('./config')
const processing = require('./processing')

const startApp = async () => {
  if (config.processingActive) {
    await processing.start()
  } else {
    console.info('Processing capabilities are currently not enabled in this environment')
  }
}

(async () => {
  await startApp()
})()

module.exports = startApp
