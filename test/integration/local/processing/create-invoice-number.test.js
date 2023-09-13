const db = require('../../../../app/data')

const { createInvoiceNumber } = require('../../../../app/processing/create-invoice-number')

const paymentRequest = {
  frn: 1234567890,
  schemeId: 1,
  marketingYear: 2021,
  agreementNumber: '12345678'
}

describe('create invoice number', () => {
  beforeEach(async () => {
    await db.invoiceNumber.destroy({ truncate: true })
  })

  afterAll(async () => {
    await db.invoiceNumber.destroy({ truncate: true })
    await db.sequelize.close()
  })

  test('should save invoice number in database', async () => {
    await createInvoiceNumber(paymentRequest)
    const invoiceNumberRecord = await db.invoiceNumber.findOne()
    expect(invoiceNumberRecord).toBeDefined()
  })

  test('should save scheme id', async () => {
    await createInvoiceNumber(paymentRequest)
    const invoiceNumberRecord = await db.invoiceNumber.findOne()
    expect(invoiceNumberRecord.schemeId).toBe(paymentRequest.schemeId)
  })

  test('should save frn', async () => {
    await createInvoiceNumber(paymentRequest)
    const invoiceNumberRecord = await db.invoiceNumber.findOne()
    expect(invoiceNumberRecord.frn).toBe(paymentRequest.frn.toString())
  })

  test('should save agreement number', async () => {
    await createInvoiceNumber(paymentRequest)
    const invoiceNumberRecord = await db.invoiceNumber.findOne()
    expect(invoiceNumberRecord.agreementNumber).toBe(paymentRequest.agreementNumber)
  })

  test('should save hash', async () => {
    await createInvoiceNumber(paymentRequest)
    const invoiceNumberRecord = await db.invoiceNumber.findOne()
    expect(invoiceNumberRecord.hash).toBe('3D6954D1')
  })

  test('should save created date', async () => {
    await createInvoiceNumber(paymentRequest)
    const invoiceNumberRecord = await db.invoiceNumber.findOne()
    expect(invoiceNumberRecord.created).toBeDefined()
  })
})
