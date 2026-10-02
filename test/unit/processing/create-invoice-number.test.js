const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['invoiceNumbers'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { createInvoiceNumber } = require('../../../app/processing/create-invoice-number')

describe('createInvoiceNumber', () => {
  const mockPaymentRequest = {
    contractNumber: '123456',
    schemeId: 1,
    frn: 123456789012345,
    agreementNumber: 'AG123456'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves([{ invoiceId: 1 }])
  })

  test('should create invoice number successfully within the transaction', async () => {
    const result = await createInvoiceNumber(mockPaymentRequest, mockDb.trx)

    expect(mockDb.tables.invoiceNumbers).toHaveBeenCalledWith(mockDb.trx)
    expect(mockDb.builder.insert).toHaveBeenCalledWith({
      schemeId: mockPaymentRequest.schemeId,
      frn: mockPaymentRequest.frn,
      agreementNumber: mockPaymentRequest.agreementNumber,
      created: expect.any(Date)
    })
    expect(mockDb.builder.returning).toHaveBeenCalledWith('invoiceId')
    expect(result).toBe('X0000001123456V000')
  })

  test('should not insert message fields that are not columns', async () => {
    await createInvoiceNumber({ ...mockPaymentRequest, invoiceLines: [], value: 100 }, mockDb.trx)

    expect(mockDb.builder.insert.mock.calls[0][0]).not.toHaveProperty('contractNumber')
    expect(mockDb.builder.insert.mock.calls[0][0]).not.toHaveProperty('invoiceLines')
    expect(mockDb.builder.insert.mock.calls[0][0]).not.toHaveProperty('value')
  })

  test('should use the pool when no transaction is provided', async () => {
    await createInvoiceNumber(mockPaymentRequest)

    expect(mockDb.tables.invoiceNumbers).toHaveBeenCalledWith(undefined)
  })

  test('should use the pool when transaction is null', async () => {
    await createInvoiceNumber(mockPaymentRequest, null)

    expect(mockDb.tables.invoiceNumbers).toHaveBeenCalledWith(undefined)
  })

  test('should return invoice number if one is set', async () => {
    const mockPRWithInvoiceNumber = {
      ...mockPaymentRequest,
      invoiceNumber: 'X1234Z1234V000'
    }
    const result = await createInvoiceNumber(mockPRWithInvoiceNumber, mockDb.trx)

    expect(mockDb.tables.invoiceNumbers).not.toHaveBeenCalled()
    expect(result).toBe('X1234Z1234V000')
  })

  test('should handle error during invoice number creation', async () => {
    mockDb.builder.rejects(new Error('Database error'))

    await expect(createInvoiceNumber(mockPaymentRequest, mockDb.trx)).rejects.toThrow('Database error')
  })
})
