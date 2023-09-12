const Joi = require('joi')
const { PRODUCTION } = require('../constants/environments')

const mqSchema = Joi.object({
  messageQueue: {
    host: Joi.string(),
    username: Joi.string(),
    password: Joi.string(),
    useCredentialChain: Joi.bool().default(false),
    appInsights: Joi.object()
  },
  paymentTopic: {
    address: Joi.string()
  },
  eventsTopic: {
    address: Joi.string()
  }
})
const mqConfig = {
  messageQueue: {
    host: process.env.MESSAGE_QUEUE_HOST,
    username: process.env.MESSAGE_QUEUE_USER,
    password: process.env.MESSAGE_QUEUE_PASSWORD,
    useCredentialChain: process.env.NODE_ENV === PRODUCTION,
    appInsights: process.env.NODE_ENV === PRODUCTION ? require('applicationinsights') : undefined
  },
  paymentTopic: {
    address: process.env.PAYMENT_TOPIC_ADDRESS
  },
  eventsTopic: {
    address: process.env.EVENTS_TOPIC_ADDRESS
  }
}

const mqResult = mqSchema.validate(mqConfig, {
  abortEarly: false
})

if (mqResult.error) {
  throw new Error(`The message queue config is invalid. ${mqResult.error.message}`)
}

const paymentTopic = { ...mqResult.value.messageQueue, ...mqResult.value.paymentTopic }
const eventsTopic = { ...mqResult.value.messageQueue, ...mqResult.value.eventsTopic }

module.exports = {
  paymentTopic,
  eventsTopic
}
