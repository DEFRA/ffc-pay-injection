const TABLES = require('./tables')

const PRIMARY_KEYS = {
  [TABLES.invoiceNumbers]: 'invoiceId',
  [TABLES.manualUploads]: 'uploadId'
}

const COLUMNS = {
  [TABLES.invoiceNumbers]: [
    'invoiceId',
    'schemeId',
    'frn',
    'agreementNumber',
    'created'
  ],
  [TABLES.locks]: [
    'lockId'
  ],
  [TABLES.manualUploads]: [
    'uploadId',
    'filename',
    'uploader',
    'timeStamp',
    'checksum',
    'success'
  ]
}

const pickColumns = (record, table) => {
  return Object.fromEntries(
    Object.entries(record)
      .filter(([column]) => COLUMNS[table].includes(column))
      .filter(([column]) => column !== PRIMARY_KEYS[table])
  )
}

module.exports = {
  PRIMARY_KEYS,
  COLUMNS,
  pickColumns
}
