const config = require('../config')
const { EventPublisher } = require('ffc-pay-event-publisher')
const { BATCH_QUARANTINED } = require('../constants/events')
const { SOURCE } = require('../constants/source')

const sendQuarantineEvent = async (filename, error) => {
  const event = {
    source: SOURCE,
    type: BATCH_QUARANTINED,
    subject: filename,
    data: {
      message: error.message,
      filename
    }
  }
  const eventPublisher = new EventPublisher(config.eventsTopic)
  await eventPublisher.publishEvent(event)
}

module.exports = {
  sendQuarantineEvent
}
