const db = require('../data')
const { removeInvoiceNumbers } = require('./remove-invoice-numbers')

const removeAgreementData = async (retentionData) => {
  const transaction = await db.sequelize.transaction()
  try {
    const { agreementNumber, frn, schemeId } = retentionData

    await removeInvoiceNumbers(agreementNumber, frn, schemeId, transaction)

    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

module.exports = {
  removeAgreementData
}
