const { removeAgreementData } = require('../../../app/retention')
const db = require('../../../app/data')

jest.mock('../../../app/data', () => ({
  sequelize: {
    transaction: jest.fn()
  }
}))

jest.mock('../../../app/retention/remove-invoice-numbers', () => ({
  removeInvoiceNumbers: jest.fn()
}))

const { removeInvoiceNumbers } = require('../../../app/retention/remove-invoice-numbers')

describe('removeAgreementData', () => {
  const agreementNumber = 'AGR123'
  const frn = 456789
  const schemeId = 10

  let transaction

  beforeEach(() => {
    jest.clearAllMocks()

    transaction = {
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue()
    }
    db.sequelize.transaction.mockResolvedValue(transaction)
  })

  test('removes data from all tables', async () => {
    removeInvoiceNumbers.mockResolvedValue()

    const retentionData = {
      agreementNumber,
      frn,
      schemeId
    }

    await removeAgreementData(retentionData)

    expect(db.sequelize.transaction).toHaveBeenCalledTimes(1)
    expect(removeInvoiceNumbers).toHaveBeenCalledWith(agreementNumber, frn, schemeId, transaction)
    expect(transaction.commit).toHaveBeenCalledTimes(1)
    expect(transaction.rollback).not.toHaveBeenCalled()
  })

  test('rolls back transaction and throws error if removeInvoiceNumbers throws', async () => {
    const error = new Error('removeInvoiceNumbers failure')
    removeInvoiceNumbers.mockRejectedValue(error)

    const retentionData = {
      agreementNumber,
      frn,
      schemeId
    }

    await expect(removeAgreementData(retentionData)).rejects.toThrow('removeInvoiceNumbers failure')

    expect(transaction.rollback).toHaveBeenCalledTimes(1)
    expect(transaction.commit).not.toHaveBeenCalled()
  })
})
