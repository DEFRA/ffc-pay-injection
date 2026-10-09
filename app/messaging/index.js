const { createServiceBusClient, createReceiver, subscribeReceiver, closeSenders } = require('./service-bus')
const config = require('../config')
const { processRetentionMessage } = require('./process-retention-message')

let sbClient
let retentionReceiver

const start = async () => {
  sbClient = createServiceBusClient(config.retentionSubscription)
  const retentionAction = message => processRetentionMessage(message, retentionReceiver)
  retentionReceiver = createReceiver(sbClient, config.retentionSubscription)
  subscribeReceiver(retentionReceiver, retentionAction)

  console.log('Ready to receive retention messages')
}

const stop = async () => {
  if (retentionReceiver) {
    try {
      await retentionReceiver.close()
    } catch (err) {
      console.error('Error closing retention receiver:', err)
    }
  }
  retentionReceiver = null

  if (sbClient) {
    try {
      await sbClient.close()
    } catch (err) {
      console.error('Error closing Service Bus client:', err)
    }
  }
  sbClient = null

  await closeSenders()
}

module.exports = { start, stop }
