const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['locks'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

jest.mock('../../../app/config', () => ({ processingInterval: 1000 }))
jest.mock('../../../app/storage', () => ({ getInboundFileList: jest.fn() }))
jest.mock('../../../app/processing/is-payment-file', () => ({ isPaymentFile: jest.fn() }))
jest.mock('../../../app/processing/process-payment-file', () => ({ processPaymentFile: jest.fn() }))

const { getInboundFileList } = require('../../../app/storage')
const { isPaymentFile } = require('../../../app/processing/is-payment-file')
const { processPaymentFile } = require('../../../app/processing/process-payment-file')
const { start } = require('../../../app/processing')

describe('processing start', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockDb.builder.resolves()
    getInboundFileList.mockResolvedValue(['a.csv', 'ignore.txt'])
    isPaymentFile.mockImplementation(filename => filename.endsWith('.csv'))
    processPaymentFile.mockResolvedValue()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
    console.error.mockRestore()
  })

  test('takes a row lock inside a transaction then commits it', async () => {
    await start()

    expect(mockDb.tables.locks).toHaveBeenCalledWith(mockDb.trx)
    expect(mockDb.builder.where).toHaveBeenCalledWith({ lockId: 1 })
    expect(mockDb.builder.forUpdate).toHaveBeenCalledTimes(1)
    expect(mockDb.builder.first).toHaveBeenCalledTimes(1)
  })

  test('processes payment files in a transaction and commits', async () => {
    await start()

    expect(processPaymentFile).toHaveBeenCalledTimes(1)
    expect(processPaymentFile).toHaveBeenCalledWith('a.csv', mockDb.trx)
    expect(mockDb.trx.commit).toHaveBeenCalledTimes(2)
    expect(mockDb.trx.rollback).not.toHaveBeenCalled()
  })

  test('rolls back if a file fails to process', async () => {
    processPaymentFile.mockRejectedValue(new Error('bad file'))

    await start()

    expect(mockDb.trx.rollback).toHaveBeenCalledTimes(1)
  })

  test('logs unexpected errors and reschedules', async () => {
    getInboundFileList.mockRejectedValue(new Error('storage down'))

    await start()

    expect(console.error).toHaveBeenCalledWith('Unexpected error in processing loop:', expect.any(Error))
    expect(jest.getTimerCount()).toBe(1)
  })
})
