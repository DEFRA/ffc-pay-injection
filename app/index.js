require('log-timestamp')
require('./insights').setup()

const config = require('./config')
const processing = require('./processing')
const { start: startServer } = require('./server')

const startApp = async () => {
  await startServer()
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
