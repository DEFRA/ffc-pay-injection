const db = require('../data')

const createInvoiceNumber = async (paymentRequest, transaction) => {
  const invoiceNumberRecord = await db.invoiceNumber.create({ ...paymentRequest, created: new Date() }, { transaction })
  return `X${invoiceNumberRecord.invoiceId.toString().padStart(8, '0')}${paymentRequest.agreementNumber}V000`
}

module.exports = {
  createInvoiceNumber
}
