const { MessageReceiver } = require('ffc-messaging')
const config = require('../config')
const { processRetentionMessage } = require('./process-retention-message')

let retentionReceiver

const start = async () => {
  const retentionAction = message => processRetentionMessage(message, retentionReceiver)
  retentionReceiver = new MessageReceiver(config.retentionSubscription, retentionAction)
  await retentionReceiver.subscribe()

  console.log('Ready to receive retention messages')
}

const stop = async () => {
  await retentionReceiver.closeConnection()
}

module.exports = { start, stop }
