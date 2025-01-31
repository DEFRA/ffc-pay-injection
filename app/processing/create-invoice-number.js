const db = require('../data')

const invoiceLength = 7

const createInvoiceNumber = async (paymentRequest, transaction) => {
  const invoiceNumberRecord = await db.invoiceNumber.create({ ...paymentRequest, created: new Date() }, { transaction })
  return `X${invoiceNumberRecord.invoiceId.toString().padStart(invoiceLength, '0')}${paymentRequest.contractNumber}V000`
}

module.exports = {
  createInvoiceNumber
}
