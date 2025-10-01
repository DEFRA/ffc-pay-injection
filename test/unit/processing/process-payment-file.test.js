jest.mock('../../../app/storage')
const { downloadFile, archiveFile } = require('../../../app/storage')

jest.mock('../../../app/processing/parse-payment-file')
const { parsePaymentFile } = require('../../../app/processing/parse-payment-file')

jest.mock('../../../app/processing/quarantine-file')
const { quarantineFile } = require('../../../app/processing/quarantine-file')

jest.mock('../../../app/messaging')
const { sendPaymentMessages } = require('../../../app/messaging')

jest.mock('../../../app/event')
const { sendSuccessEvent } = require('../../../app/event')

const { processPaymentFile } = require('../../../app/processing/process-payment-file')

const filename = 'FFCS_Manual_Batch_20230913140000.csv'

describe('process payment file with no data', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('throws error if data is empty', async () => {
    const { parsePaymentFile } = jest.requireActual('../../../app/processing/parse-payment-file')
    await expect(parsePaymentFile('', filename, {}))
      .rejects
      .toThrow('No data found in payment file')
  })

  test('throws error if data is null', async () => {
    const { parsePaymentFile } = jest.requireActual('../../../app/processing/parse-payment-file')
    await expect(parsePaymentFile(null, filename, {}))
      .rejects
      .toThrow('No data found in payment file')
  })
})

describe('process payment file', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    parsePaymentFile.mockResolvedValue([{ schemeId: 1 }])
  })

  test('should download file', async () => {
    await processPaymentFile(filename)
    expect(downloadFile).toHaveBeenCalledWith(filename)
  })

  test('should parse file', async () => {
    await processPaymentFile(filename)
    expect(parsePaymentFile).toHaveBeenCalled()
  })

  test('should quarantine file if parse fails', async () => {
    parsePaymentFile.mockImplementation(() => {
      throw new Error('Parse error')
    })
    await processPaymentFile(filename)
    expect(quarantineFile).toHaveBeenCalledWith(filename, new Error('Parse error'))
  })

  test('should archive file if parse succeeds', async () => {
    await processPaymentFile(filename)
    expect(archiveFile).toHaveBeenCalledWith(filename)
  })

  test('should not archive file if parse fails', async () => {
    parsePaymentFile.mockImplementation(() => {
      throw new Error('Parse error')
    })
    await processPaymentFile(filename)
    expect(archiveFile).not.toHaveBeenCalled()
  })

  test('should not send messages if parse fails', async () => {
    parsePaymentFile.mockImplementation(() => {
      throw new Error('Parse error')
    })
    await processPaymentFile(filename)
    expect(sendPaymentMessages).not.toHaveBeenCalled()
  })

  test('should send messages if parse succeeds', async () => {
    await processPaymentFile(filename)
    expect(sendPaymentMessages).toHaveBeenCalled()
  })

  test('should send success event if parse succeeds', async () => {
    await processPaymentFile(filename)
    expect(sendSuccessEvent).toHaveBeenCalledWith(filename)
  })
})
