const db = require('../../../app/data')
const { createInvoiceNumber } = require('../../../app/processing/create-invoice-number')

jest.mock('../../../app/data')

describe('createInvoiceNumber', () => {
  const mockTransaction = {}
  const mockPaymentRequest = {
    contractNumber: '123456',
    schemeId: 1,
    frn: 123456789012345,
    agreementNumber: 'AG123456'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should create invoice number successfully', async () => {
    const mockInvoiceNumberRecord = { invoiceId: 1 }
    db.invoiceNumber.create.mockResolvedValue(mockInvoiceNumberRecord)

    const result = await createInvoiceNumber(mockPaymentRequest, mockTransaction)

    expect(db.invoiceNumber.create).toHaveBeenCalledWith(
      {
        ...mockPaymentRequest,
        schemeId: mockPaymentRequest.schemeId,
        frn: mockPaymentRequest.frn,
        agreementNumber: mockPaymentRequest.agreementNumber,
        created: expect.any(Date)
      },
      { transaction: mockTransaction }
    )
    expect(result).toBe('X0000001123456V000')
  })

  test('should handle error during invoice number creation', async () => {
    db.invoiceNumber.create.mockRejectedValue(new Error('Database error'))

    await expect(createInvoiceNumber(mockPaymentRequest, mockTransaction)).rejects.toThrow('Database error')
  })
})
