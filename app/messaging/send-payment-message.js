const config = require('../config')
const { getSender, sendBatchMessages } = require('./service-bus')
const { createMessage } = require('./create-message')

const sendPaymentMessages = async (body) => {
  const messages = body.map(message => createMessage(message))
  const sender = getSender(config.paymentTopic)
  await sendBatchMessages(sender, messages)
}

module.exports = {
  sendPaymentMessages
}
