const { PRODUCTION } = require('../constants/environments')

const isProd = () => {
  return process.env.NODE_ENV === PRODUCTION
}

const dbConfig = {
  database: process.env.POSTGRES_DB || 'ffc_pay_injection',
  host: process.env.POSTGRES_HOST || 'ffc-pay-injection-postgres',
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
  logging: process.env.POSTGRES_LOGGING || false,
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  schema: process.env.POSTGRES_SCHEMA_NAME || 'public',
  ssl: isProd(),
  username: process.env.POSTGRES_USERNAME
}

module.exports = {
  development: dbConfig,
  production: dbConfig,
  test: dbConfig
}
