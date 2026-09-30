const { invoiceNumbers } = require('../database')

const invoiceLength = 7

const createInvoiceNumber = async (paymentRequest, transaction) => {
  if (paymentRequest.invoiceNumber) {
    return paymentRequest.invoiceNumber
  }
  const { schemeId, frn, agreementNumber } = paymentRequest
  const [invoiceNumberRecord] = await invoiceNumbers(transaction ?? undefined)
    .insert({ schemeId, frn, agreementNumber, created: new Date() })
    .returning('invoiceId')
  return `X${invoiceNumberRecord.invoiceId.toString().padStart(invoiceLength, '0')}${paymentRequest.contractNumber}V000`
}

module.exports = {
  createInvoiceNumber
}
