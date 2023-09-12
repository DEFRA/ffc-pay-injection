const db = require('../data')
const { createHash } = require('./create-hash')

const createInvoiceNumber = async (paymentRequest, transaction) => {
  const hash = createHash(`${paymentRequest.schemeId}-${paymentRequest.frn}-${paymentRequest.marketingYear}-${paymentRequest.agreementNumber}`)
  const invoiceNumberRecord = await db.invoiceNumber.create({ ...paymentRequest, hash, created: new Date() }, { transaction })
  return `X${invoiceNumberRecord.invoiceId.toString().padStart(8, '0')}-${hash}`
}

module.exports = {
  createInvoiceNumber
}
