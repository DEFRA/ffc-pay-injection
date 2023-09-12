const { MessageBatchSender } = require('ffc-messaging')
const { createMessage } = require('./create-message')
const config = require('../config')

const sendPaymentMessages = async (body) => {
  const messages = body.map(message => createMessage(message))
  const sender = new MessageBatchSender(config.paymentTopic)
  await sender.sendBatchMessages(messages)
  await sender.closeConnection()
}

module.exports = {
  sendPaymentMessages
}
