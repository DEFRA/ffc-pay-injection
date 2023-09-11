require('./insights').setup()
require('log-timestamp')
const processing = require('./processing')

module.exports = (async () => {
  await processing.start()
})()
