jest.mock('../../../app/storage')
jest.mock('../../../app/processing/parse-payment-file')
jest.mock('../../../app/processing/quarantine-file')
jest.mock('../../../app/messaging')
jest.mock('../../../app/event')
jest.mock('../../../app/processing/update-success')

const { downloadFile, archiveFile } = require('../../../app/storage')
const { parsePaymentFile } = require('../../../app/processing/parse-payment-file')
const { quarantineFile } = require('../../../app/processing/quarantine-file')
const { sendPaymentMessages } = require('../../../app/messaging')
const { sendSuccessEvent } = require('../../../app/event')
const { updateSuccess } = require('../../../app/processing/update-success')
const { processPaymentFile } = require('../../../app/processing/process-payment-file')

const filename = 'FFCS_Manual_Batch_20230913140000.csv'

describe('parsePaymentFile validations', () => {
  const { parsePaymentFile: realParse } = jest.requireActual(
    '../../../app/processing/parse-payment-file'
  )

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
    downloadFile.mockResolvedValue('file data')
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
      const error = new Error('Parse error')
      parsePaymentFile.mockRejectedValue(error)

      await expect(run()).rejects.toThrow(error)
      expect(quarantineFile).toHaveBeenCalledWith(filename, error)
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
      const error = new Error('Parse error')
      parsePaymentFile.mockRejectedValue(error)

      await expect(run()).rejects.toThrow(error)
      expect(archiveFile).not.toHaveBeenCalled()
    } else {
      await run()
      expect(archiveFile).toHaveBeenCalledWith(filename)
    }
  })

  test.each([
    ['sends messages on success', true],
    ['does not send messages on parse error', false]
  ])('%s', async (_, shouldSend) => {
    if (!shouldSend) {
      const error = new Error('Parse error')
      parsePaymentFile.mockRejectedValue(error)

      await expect(run()).rejects.toThrow(error)
      expect(sendPaymentMessages).not.toHaveBeenCalled()
    } else {
      await run()
      expect(sendPaymentMessages).toHaveBeenCalled()
    }
  })

  test('sends success event if parse succeeds', async () => {
    await run()
    expect(sendSuccessEvent).toHaveBeenCalledWith(filename)
  })

  test('quarantines and rethrows if sendPaymentMessages fails', async () => {
    const error = new Error('Messaging error')
    sendPaymentMessages.mockRejectedValue(error)

    await expect(run()).rejects.toThrow(error)

    expect(updateSuccess).toHaveBeenCalledWith(filename, false)
    expect(quarantineFile).toHaveBeenCalledWith(filename, error)
    expect(archiveFile).not.toHaveBeenCalled()
    expect(sendSuccessEvent).not.toHaveBeenCalled()
  })

  test('does nothing when paymentRequests is empty', async () => {
    parsePaymentFile.mockResolvedValue([])

    await run()

    expect(sendPaymentMessages).not.toHaveBeenCalled()
    expect(archiveFile).not.toHaveBeenCalled()
    expect(sendSuccessEvent).not.toHaveBeenCalled()
  })
})

describe('processPaymentFile additional coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    parsePaymentFile.mockResolvedValue([{ schemeId: 1 }])
    updateSuccess.mockResolvedValue()
    quarantineFile.mockResolvedValue()
    archiveFile.mockResolvedValue()
    sendSuccessEvent.mockResolvedValue()
    sendPaymentMessages.mockResolvedValue()
    downloadFile.mockResolvedValue('file data')
  })

  test('calls updateSuccess(false) and quarantines if parsePaymentFile throws', async () => {
    const error = new Error('Parse error')
    parsePaymentFile.mockRejectedValue(error)

    await expect(processPaymentFile(filename)).rejects.toThrow(error)

    expect(updateSuccess).toHaveBeenCalledWith(filename, false)
    expect(quarantineFile).toHaveBeenCalledWith(filename, error)
  })

  test('calls updateSuccess(true) on success', async () => {
    await processPaymentFile(filename)

    expect(updateSuccess).toHaveBeenCalledWith(filename, true)
  })

  test('calls updateSuccess(false) and quarantines if sendPaymentMessages throws', async () => {
    const error = new Error('Messaging error')
    sendPaymentMessages.mockRejectedValue(error)

    await expect(processPaymentFile(filename)).rejects.toThrow(error)

    expect(updateSuccess).toHaveBeenCalledWith(filename, false)
    expect(quarantineFile).toHaveBeenCalledWith(filename, error)
  })

  test('throws immediately if downloadFile fails', async () => {
    const error = new Error('Download failed')
    downloadFile.mockRejectedValue(error)

    await expect(processPaymentFile(filename)).rejects.toThrow(error)

    expect(parsePaymentFile).not.toHaveBeenCalled()
    expect(updateSuccess).not.toHaveBeenCalled()
    expect(quarantineFile).not.toHaveBeenCalled()
  })

  test('logs info and payment summary', async () => {
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {})
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    await processPaymentFile(filename)

    expect(infoSpy).toHaveBeenCalledWith(`Processing payment file: ${filename}`)
    expect(logSpy).toHaveBeenCalledWith(
      'Payments published:',
      expect.stringContaining('schemeId')
    )

    infoSpy.mockRestore()
    logSpy.mockRestore()
  })
})
