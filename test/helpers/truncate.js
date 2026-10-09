const db = require('../../app/database')

const tables = [
  'invoiceNumbers',
  'lock',
  'manualUploads'
]

const truncate = async () => {
  const quoted = tables.map(table => `"${table}"`).join(', ')
  await db.client.raw(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`)
}

module.exports = {
  truncate
}
