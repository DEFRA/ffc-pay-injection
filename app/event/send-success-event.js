const { EventPublisher } = require('ffc-pay-event-publisher')
const config = require('../config')
const { SOURCE } = require('../constants/source')
const { BATCH_PROCESSED } = require('../constants/events')

const sendSuccessEvent = async (filename) => {
  const event = {
    source: SOURCE,
    type: BATCH_PROCESSED,
    subject: filename,
    data: {
      filename
    }
  }
  const eventPublisher = new EventPublisher(config.eventsTopic)
  await eventPublisher.publishEvent(event)
}

module.exports = {
  sendSuccessEvent
}
