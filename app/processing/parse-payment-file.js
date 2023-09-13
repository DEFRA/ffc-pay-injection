const moment = require('moment')
const { v4: uuidv4 } = require('uuid')
const { GBP } = require('../constants/currency')
const { INJECTION } = require('../constants/source-system')
const { getSchemeId } = require('./get-scheme-id')
const { getDescription } = require('./get-description')
const { convertToPence, convertToPounds } = require('../currency-convert')
const { createInvoiceNumber } = require('./create-invoice-number')

const parsePaymentFile = async (data, filename, transaction) => {
  const csv = data.trim().split(/\r?\n/)
  const paymentRequests = [...csv.filter(x => x).reduce((x, y) => {
    const values = y.split(',')
    const schemeId = getSchemeId(values[0])
    const key = `${schemeId}-${values[1]}-${values[2]}-${values[3]}`

    // if key doesn't exist then first instance so create new group
    const item = x.get(key) || ({
      schemeId,
      frn: values[1],
      marketingYear: values[2],
      agreementNumber: values[3],
      dueDate: values[7],
      invoiceLines: [],
      value: 0
    })
    item.value += convertToPence(values[6])
    item.invoiceLines.push({
      schemeCode: values[4],
      description: getDescription(values[5]),
      value: values[6]
    })

    return x.set(key, item)
  }, new Map()).values()]

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
