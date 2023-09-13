const moment = require('moment')
const { v4: uuidv4 } = require('uuid')
const { GBP } = require('../constants/currency')
const { INJECTION } = require('../constants/source-system')
const { convertToPounds } = require('../currency-convert')
const { createInvoiceNumber } = require('./create-invoice-number')
const { getPaymentRequests } = require('./get-payment-requests')

const parsePaymentFile = async (data, filename, transaction) => {
  const csv = data.trim().split(/\r?\n/)
  const paymentRequests = getPaymentRequests(csv)

  for (const paymentRequest of paymentRequests) {
    paymentRequest.sourceSystem = INJECTION
    paymentRequest.paymentRequestNumber = 0
    paymentRequest.correlationId = uuidv4()
    paymentRequest.contractNumber = paymentRequest.agreementNumber
    paymentRequest.currency = GBP
    paymentRequest.batch = filename
    paymentRequest.dueDate = moment(paymentRequest.dueDate, ['DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY']).format('YYYY-MM-DD')
    paymentRequest.value = convertToPounds(paymentRequest.value)
    paymentRequest.invoiceNumber = await createInvoiceNumber(paymentRequest, transaction)
  }

  return paymentRequests
}

module.exports = {
  parsePaymentFile
}
