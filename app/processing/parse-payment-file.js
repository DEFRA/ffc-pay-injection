const moment = require('moment')
const { v4: uuidv4 } = require('uuid')
const { GBP } = require('../constants/currency')
const { INJECTION } = require('../constants/source-system')
const { convertToPounds } = require('../currency-convert')
const { createInvoiceNumber } = require('./create-invoice-number')
const { getPaymentRequests } = require('./get-payment-requests')

const outputDateFormat = 'YYYY-MM-DD'
const acceptedDateFormats = ['DD/MM/YYYY', outputDateFormat, 'DD-MM-YYYY']

const parsePaymentFile = async (data, filename, transaction) => {
  if (!data?.trim()) {
    throw new Error('No data found in payment file')
  }

  const csv = data.trim().replace(/(['"])/g, '').split(/\r?\n/)

  const paymentRequests = getPaymentRequests(csv)

  for (const paymentRequest of paymentRequests) {
    paymentRequest.sourceSystem = INJECTION
    paymentRequest.paymentRequestNumber = 0
    paymentRequest.correlationId = uuidv4()
    paymentRequest.currency = GBP
    paymentRequest.batch = filename
    paymentRequest.dueDate = paymentRequest.dueDate ? moment(paymentRequest.dueDate, acceptedDateFormats).format(outputDateFormat) : undefined
    paymentRequest.recoveryDate = paymentRequest.recoveryDate ? moment(paymentRequest.recoveryDate, acceptedDateFormats).format(outputDateFormat) : undefined
    paymentRequest.originalSettlementDate = paymentRequest.originalSettlementDate ? moment(paymentRequest.originalSettlementDate, acceptedDateFormats).format(outputDateFormat) : undefined
    paymentRequest.debtType = paymentRequest.debtType?.toLowerCase()
    paymentRequest.value = convertToPounds(paymentRequest.value)
    paymentRequest.invoiceNumber = await createInvoiceNumber(paymentRequest, transaction)
    paymentRequest.agreementNumber = paymentRequest.invoiceLines?.[0]?.agreementNumber
  }

  return paymentRequests
}

module.exports = {
  parsePaymentFile
}
