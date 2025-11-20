jest.mock('../../../app/storage')
jest.mock('../../../app/processing/parse-payment-file')
jest.mock('../../../app/processing/quarantine-file')
jest.mock('../../../app/messaging')
jest.mock('../../../app/event')

const { downloadFile, archiveFile } = require('../../../app/storage')
const { parsePaymentFile } = require('../../../app/processing/parse-payment-file')
const { quarantineFile } = require('../../../app/processing/quarantine-file')
const { sendPaymentMessages } = require('../../../app/messaging')
const { sendSuccessEvent } = require('../../../app/event')
const { processPaymentFile } = require('../../../app/processing/process-payment-file')

const filename = 'FFCS_Manual_Batch_20230913140000.csv'

describe('parsePaymentFile validations', () => {
  const { parsePaymentFile: realParse } = jest.requireActual('../../../app/processing/parse-payment-file')

  test.each([
    ['', 'No data found in payment file'],
    [null, 'No data found in payment file']
  ])('throws error if data is %p', async (data, expectedMessage) => {
    await expect(realParse(data, filename, {})).rejects.toThrow(expectedMessage)
  })
})

describe('processPaymentFile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    parsePaymentFile.mockResolvedValue([{ schemeId: 1 }])
  })

  const run = () => processPaymentFile(filename)

  test('downloads the file', async () => {
    await run()
    expect(downloadFile).toHaveBeenCalledWith(filename)
  })

  test('parses the file', async () => {
    await run()
    expect(parsePaymentFile).toHaveBeenCalled()
  })

  test.each([
    ['quarantines file on parse error', true],
    ['does not quarantine on success', false]
  ])('%s', async (_, shouldQuarantine) => {
    if (shouldQuarantine) {
      parsePaymentFile.mockImplementation(() => { throw new Error('Parse error') })
      await run()
      expect(quarantineFile).toHaveBeenCalledWith(filename, new Error('Parse error'))
    } else {
      await run()
      expect(quarantineFile).not.toHaveBeenCalled()
    }
  })

  test.each([
    ['archives file on success', true],
    ['does not archive on parse error', false]
  ])('%s', async (_, shouldArchive) => {
    if (!shouldArchive) {
      parsePaymentFile.mockImplementation(() => { throw new Error('Parse error') })
    }
    await run()
    if (shouldArchive) {
      expect(archiveFile).toHaveBeenCalledWith(filename)
    } else {
      expect(archiveFile).not.toHaveBeenCalled()
    }
  })

  test.each([
    ['sends messages on success', true],
    ['does not send messages on parse error', false]
  ])('%s', async (_, shouldSend) => {
    if (!shouldSend) {
      parsePaymentFile.mockImplementation(() => { throw new Error('Parse error') })
    }

    await run()
    
    if (shouldSend) {
      expect(sendPaymentMessages).toHaveBeenCalled()
    } else {
      expect(sendPaymentMessages).not.toHaveBeenCalled()
    }
  })

  test('sends success event if parse succeeds', async () => {
    await run()
    expect(sendSuccessEvent).toHaveBeenCalledWith(filename)
  })
})
