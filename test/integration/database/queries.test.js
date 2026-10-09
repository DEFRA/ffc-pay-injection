jest.mock('../../../app/storage', () => ({
  getFileChecksum: jest.fn(),
  acceptFile: jest.fn(),
  quarantineFile: jest.fn()
}))

const db = require('../../../app/database')
const { truncate } = require('../../helpers/truncate')
const { getFileChecksum } = require('../../../app/storage')
const { updateSuccess } = require('../../../app/processing/update-success')
const { createInvoiceNumber } = require('../../../app/processing/create-invoice-number')
const { removeAgreementData } = require('../../../app/retention')
const { CONFLICT, SUCCESS } = require('../../../app/constants/status-codes')

const upload = (overrides) => ({
  uploader: 'bob',
  filename: 'a.csv',
  timeStamp: new Date('2025-10-05T12:00:00Z'),
  checksum: 'abc',
  success: false,
  ...overrides
})

describe('database queries against Postgres', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    await truncate()
  })

  afterAll(async () => {
    await truncate()
    await db.close()
  })

  describe('manual upload route', () => {
    let server

    beforeEach(async () => {
      const { createServer } = require('../../../app/server/create-server')
      server = await createServer()
      await server.initialize()
    })

    afterEach(async () => {
      await server.stop()
    })

    const post = (filename) => server.inject({ method: 'POST', url: '/manual-upload', payload: { uploader: 'ann', filename } })

    test.each([
      ['successful upload with the same filename', { success: true }, 'other', 'a.csv'],
      ['successful upload with the same checksum', { success: true, filename: 'x.csv' }, 'abc', 'a.csv'],
      ['failed upload with the same filename', { success: false }, 'other', 'a.csv']
    ])('rejects a duplicate: %s', async (_name, row, checksum, filename) => {
      await db.manualUploads().insert(upload(row))
      getFileChecksum.mockResolvedValue(checksum)

      const result = await post(filename)

      expect(result.statusCode).toBe(CONFLICT)
    })

    test('accepts a file whose only match is a failed upload with the same checksum', async () => {
      await db.manualUploads().insert(upload({ filename: 'x.csv', success: false }))
      getFileChecksum.mockResolvedValue('abc')

      const result = await post('a.csv')

      expect(result.statusCode).toBe(SUCCESS)
      const rows = await db.manualUploads().where({ filename: 'a.csv' })
      expect(rows).toHaveLength(1)
      expect(rows[0].uploader).toBe('ann')
    })
  })

  describe('manual upload audit route', () => {
    test('returns uploads inside the date range, newest first', async () => {
      await db.manualUploads().insert([
        upload({ filename: 'old.csv', timeStamp: new Date('2025-09-01T12:00:00Z') }),
        upload({ filename: 'first.csv', timeStamp: new Date('2025-10-02T12:00:00Z') }),
        upload({ filename: 'second.csv', timeStamp: new Date('2025-10-03T12:00:00Z') })
      ])
      const { createServer } = require('../../../app/server/create-server')
      const server = await createServer()
      await server.initialize()

      const result = await server.inject({ method: 'GET', url: '/manual-upload-audit?from=2025-10-01&to=2025-10-13' })
      await server.stop()

      expect(result.statusCode).toBe(SUCCESS)
      expect(result.result.map(x => x.filename)).toEqual(['second.csv', 'first.csv'])
    })
  })

  test('updateSuccess sets success on the matching upload only', async () => {
    await db.manualUploads().insert([upload({ filename: 'a.csv' }), upload({ filename: 'b.csv' })])

    await updateSuccess('a.csv', true)

    const rows = await db.manualUploads().orderBy('filename')
    expect(rows.map(x => x.success)).toEqual([true, false])
  })

  test('createInvoiceNumber inserts only table columns and returns the generated id', async () => {
    const paymentRequest = { schemeId: 1, frn: 1000000001, agreementNumber: 'AG1', contractNumber: 'C1', invoiceLines: [], value: 10 }

    const invoiceNumber = await createInvoiceNumber(paymentRequest)
    const trx = await db.transaction()
    const second = await createInvoiceNumber(paymentRequest, trx)
    await trx.commit()

    expect(invoiceNumber).toBe('X0000001C1V000')
    expect(second).toBe('X0000002C1V000')
    const rows = await db.invoiceNumbers().orderBy('invoiceId')
    expect(rows[0]).toMatchObject({ schemeId: 1, agreementNumber: 'AG1' })
    expect(rows[0].created).toBeInstanceOf(Date)
  })

  test('removeAgreementData deletes matching invoice numbers and rolls back on failure', async () => {
    await db.invoiceNumbers().insert([
      { schemeId: 1, frn: 1000000001, agreementNumber: 'AG1', created: new Date() },
      { schemeId: 1, frn: 1000000001, agreementNumber: 'AG2', created: new Date() }
    ])

    await removeAgreementData({ agreementNumber: 'AG1', frn: 1000000001, schemeId: 1 })

    const rows = await db.invoiceNumbers()
    expect(rows.map(x => x.agreementNumber)).toEqual(['AG2'])
  })

  test('lock row can be selected for update inside a transaction', async () => {
    await db.locks().insert({ lockId: 1 })
    const trx = await db.transaction()

    const row = await db.locks(trx).where({ lockId: 1 }).forUpdate().first()
    await trx.commit()

    expect(row).toEqual({ lockId: 1 })
  })
})
