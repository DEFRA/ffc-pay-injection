const db = require('../data')

const removeInvoiceNumbers = async (agreementNumber, frn, schemeId, transaction) => {
  await db.invoiceNumber.destroy({
    where: { agreementNumber, frn, schemeId },
    transaction
  })
}

module.exports = {
  removeInvoiceNumbers
}
