const Joi = require('joi')
const mqConfig = require('./message')
const storageConfig = require('./storage')
const dbConfig = require('./database')
const { DEVELOPMENT, TEST, PRODUCTION } = require('../constants/environments')

const schema = Joi.object({
  env: Joi.string().valid(DEVELOPMENT, TEST, PRODUCTION).default(DEVELOPMENT),
  processingInterval: Joi.number().default(10000)
})

const config = {
  env: process.env.NODE_ENV,
  processingInterval: process.env.PROCESSING_INTERVAL
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The config is invalid. ${result.error.message}`)
}

const value = result.value

value.isDev = value.env === DEVELOPMENT
value.isTest = value.env === TEST
value.isProd = value.env === PRODUCTION
value.paymentSubscription = mqConfig.paymentSubscription
value.eventsTopic = mqConfig.eventsTopic
value.storageConfig = storageConfig
value.dbConfig = dbConfig

module.exports = value
