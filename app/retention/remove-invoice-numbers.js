const { invoiceNumbers } = require('../database')

const removeInvoiceNumbers = async (agreementNumber, frn, schemeId, transaction) => {
  await invoiceNumbers(transaction ?? undefined)
    .where({ agreementNumber, frn, schemeId })
    .del()
}

module.exports = {
  removeInvoiceNumbers
}
