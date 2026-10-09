const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['invoiceNumbers'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { removeInvoiceNumbers } = require('../../../app/retention/remove-invoice-numbers')

describe('removeInvoiceNumbers', () => {
  const agreementNumber = 'AGR123'
  const frn = 456789
  const schemeId = 10

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves()
  })

  test('deletes invoice numbers within the transaction', async () => {
    await removeInvoiceNumbers(agreementNumber, frn, schemeId, mockDb.trx)

    expect(mockDb.tables.invoiceNumbers).toHaveBeenCalledWith(mockDb.trx)
    expect(mockDb.builder.where).toHaveBeenCalledWith({ agreementNumber, frn, schemeId })
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('uses the pool if no transaction is provided', async () => {
    await removeInvoiceNumbers(agreementNumber, frn, schemeId)

    expect(mockDb.tables.invoiceNumbers).toHaveBeenCalledWith(undefined)
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('uses the pool if transaction is null', async () => {
    await removeInvoiceNumbers(agreementNumber, frn, schemeId, null)

    expect(mockDb.tables.invoiceNumbers).toHaveBeenCalledWith(undefined)
  })

  test('propagates errors from delete', async () => {
    mockDb.builder.rejects(new Error('DB failure'))

    await expect(removeInvoiceNumbers(agreementNumber, frn, schemeId, mockDb.trx)).rejects.toThrow('DB failure')
  })
})
