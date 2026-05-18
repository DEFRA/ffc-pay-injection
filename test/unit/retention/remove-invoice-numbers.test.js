const db = require('../../../app/data')
const { removeInvoiceNumbers } = require('../../../app/retention/remove-invoice-numbers')

jest.mock('../../../app/data', () => ({
  invoiceNumber: {
    destroy: jest.fn()
  }
}))

describe('removeInvoiceNumbers', () => {
  const agreementNumber = 'AGR123'
  const frn = 456789
  const schemeId = 10
  const transaction = { id: 'transaction-object' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('calls db.invoiceNumber.destroy with correct parameters', async () => {
    await removeInvoiceNumbers(agreementNumber, frn, schemeId, transaction)

    expect(db.invoiceNumber.destroy).toHaveBeenCalledTimes(1)
    expect(db.invoiceNumber.destroy).toHaveBeenCalledWith({
      where: {
        agreementNumber,
        frn,
        schemeId
      },
      transaction
    })
  })

  test('calls db.invoiceNumber.destroy with undefined transaction if not provided', async () => {
    await removeInvoiceNumbers(agreementNumber, frn, schemeId)

    expect(db.invoiceNumber.destroy).toHaveBeenCalledWith({
      where: {
        agreementNumber,
        frn,
        schemeId
      },
      transaction: undefined
    })
  })

  test('propagates errors from db.invoiceNumber.destroy', async () => {
    const error = new Error('DB failure')
    db.invoiceNumber.destroy.mockRejectedValue(error)

    await expect(removeInvoiceNumbers(agreementNumber, frn, schemeId, transaction)).rejects.toThrow('DB failure')
  })
})
