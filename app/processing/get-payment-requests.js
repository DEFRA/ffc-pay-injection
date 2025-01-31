const { AP } = require('../constants/ledgers')
const { convertToPence } = require('../currency-convert')
const { getDescription } = require('./get-description')
const { getSchemeId } = require('./get-scheme-id')

const indexes = {
  schemeIndex: 0,
  schemeSchemeIndex: 0,
  schemePillarIndex: 1,
  frnIndex: 1,
  marketingYearIndex: 2,
  contractNumberIndex: 3,
  valueIndex: 6,
  dueDateIndex: 7,
  scheduleIndex: 8,
  ledgerIndex: 10,
  debtTypeIndex: 11,
  recoveryDateIndex: 12,
  originalInvoiceNumberIndex: 13,
  originalSettlementDateIndex: 14,
  schemeCodeIndex: 4,
  descriptionIndex: 5,
  accountCodeIndex: 9,
  fundCodeIndex: 15,
  deliveryBodyIndex: 16,
  agreementNumberIndex: 17
}

const getPaymentRequests = (csv) => {
  return [...csv.filter(x => x).reduce((x, y) => {
    const values = y.split(',')
    const schemeValues = values[indexes.schemeIndex].split('_')
    const schemeId = getSchemeId(schemeValues[indexes.schemeSchemeIndex])
    const key = `${schemeId}-${values[indexes.frnIndex]}-${values[indexes.marketingYearIndex]}-${values[indexes.contractNumberIndex]}`

    // if key doesn't exist then first instance so create new group
    const item = x.get(key) || ({
      schemeId,
      frn: values[indexes.frnIndex],
      marketingYear: values[indexes.marketingYearIndex],
      contractNumber: values[indexes.contractNumberIndex],
      dueDate: values[indexes.dueDateIndex] || undefined,
      schedule: values[indexes.scheduleIndex] || undefined,
      ledger: values[indexes.ledgerIndex] || AP,
      debtType: values[indexes.debtTypeIndex] || undefined,
      recoveryDate: values[indexes.recoveryDateIndex] || undefined,
      originalInvoiceNumber: values[indexes.originalInvoiceNumberIndex] || undefined,
      originalSettlementDate: values[indexes.originalSettlementDateIndex] || undefined,
      pillar: schemeValues[indexes.schemePillarIndex],
      invoiceLines: [],
      value: 0
    })
    item.value += convertToPence(values[indexes.valueIndex])
    item.invoiceLines.push({
      schemeCode: values[indexes.schemeCodeIndex],
      description: getDescription(values[indexes.descriptionIndex]),
      value: values[indexes.valueIndex],
      accountCode: values[indexes.accountCodeIndex],
      fundCode: values[indexes.fundCodeIndex],
      deliveryBody: values[indexes.deliveryBodyIndex],
      agreementNumber: values[indexes.agreementNumberIndex]
    })

    return x.set(key, item)
  }, new Map()).values()]
}

module.exports = {
  getPaymentRequests
}
