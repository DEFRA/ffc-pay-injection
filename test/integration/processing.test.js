jest.useFakeTimers()

const mockSendBatchMessages = jest.fn()
jest.mock('ffc-messaging', () => ({
  MessageBatchSender: jest.fn().mockImplementation(() => ({
    sendBatchMessages: mockSendBatchMessages,
    closeConnection: jest.fn()
  }))
}))

const mockPublishEvent = jest.fn()
const mockPublishEvents = jest.fn()
jest.mock('ffc-pay-event-publisher', () => ({
  EventPublisher: jest.fn().mockImplementation(() => ({
    publishEvent: mockPublishEvent,
    publishEvents: mockPublishEvents
  }))
}))

const path = require('path')
const { BlobServiceClient } = require('@azure/storage-blob')

const db = require('../../app/data')
const storageConfig = require('../../app/config/storage')
const { start } = require('../../app/processing')
const { BATCH_QUARANTINED, BATCH_PROCESSED } = require('../../app/constants/events')
const { GBP } = require('../../app/constants/currency')
const { AP } = require('../../app/constants/ledgers')

const files = {
  minimal: path.resolve(__dirname, '../files/minimal.csv'),
  multiLine: path.resolve(__dirname, '../files/multi-line.csv'),
  multiPayment: path.resolve(__dirname, '../files/multi-payment.csv'),
  schedule: path.resolve(__dirname, '../files/schedule.csv'),
  manual: path.resolve(__dirname, '../files/manual.csv'),
  manualLedger: path.resolve(__dirname, '../files/manual-ledger.csv'),
  manualLedgerRecovery: path.resolve(__dirname, '../files/manual-ledger-recovery.csv'),
  cs: path.resolve(__dirname, '../files/cs.csv'),
  csMaoassbi: path.resolve(__dirname, '../files/cs-maoassbi.csv'),
  quotes: path.resolve(__dirname, '../files/quotes.csv')
}

const filename = 'FFC_Manual_Batch_202510011200.csv'

let blobServiceClient
let container

describe('process files', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    blobServiceClient = BlobServiceClient.fromConnectionString(storageConfig.connectionStr)
    container = blobServiceClient.getContainerClient(storageConfig.container)
    await container.deleteIfExists()
    await container.createIfNotExists()
  })

  afterAll(async () => {
    await db.sequelize.close()
  })

  test('processes minimal file correctly', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(files.minimal)

    await start()

    const message = mockSendBatchMessages.mock.calls[0][0][0].body

    expect(mockSendBatchMessages).toHaveBeenCalled()
    expect(message.frn).toBe('1000000001')
    expect(message.schemeId).toBe(1)
    expect(message.paymentRequestNumber).toBe(0)
    expect(message.contractNumber).toBe('Z00000001')
    expect(message.currency).toBe(GBP)
    expect(message.dueDate).toBe('2023-10-01')
    expect(message.value).toBe('250.00')
    expect(message.invoiceNumber.endsWith('Z00000001V000')).toBe(true)
    expect(message.ledger).toBe(AP)
    expect(message.invoiceLines.length).toBe(1)
    expect(message.invoiceLines[0].description).toBe('G00 - Gross value of claim')
    expect(message.invoiceLines[0].schemeCode).toBe('80201')
    expect(message.invoiceLines[0].value).toBe('250.00')
  })

  test('archives processed files', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(files.minimal)
    await start()

    const archived = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.archiveFolder })) {
      archived.push(item.name)
    }
    expect(archived).toContain(`${storageConfig.archiveFolder}/${filename}`)
  })

  test('ignores unrelated files', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inbound}/ignore me.dat`)
    await blockBlobClient.uploadFile(files.minimal)
    await start()

    const allFiles = []

    for await (const item of container.listBlobsFlat()) {
      allFiles.push(item.name)
    }

    expect(allFiles).toContain(`${storageConfig.inbound}/ignore me.dat`)
  })

  test('quarantines invalid files and sends event', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.upload('invalid', 7)
    await start()

    const quarantined = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.quarantineFolder })) {
      quarantined.push(item.name)
    }
    expect(quarantined).toContain(`${storageConfig.quarantineFolder}/${filename}`)
    expect(mockPublishEvent.mock.calls[0][0].type).toBe(BATCH_QUARANTINED)
  })

  test('sends processed event for valid file', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(files.minimal)
    await start()

    expect(mockPublishEvent.mock.calls[0][0].type).toBe(BATCH_PROCESSED)
  })

  test.each([
    ['multiLine', 3],
    ['multiPayment', 2],
    ['schedule', 1],
    ['manual', 1],
    ['manualLedger', 1],
    ['manualLedgerRecovery', 1],
    ['cs', 1],
    ['quotes', 1],
    ['csMaoassbi', 2]
  ])('processes %s file correctly', async (key, expectedLength) => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(files[key])
    await start()

    const message = mockSendBatchMessages.mock.calls[0][0]

    if (key === 'multiLine') {
      expect(message[0].body.invoiceLines.length).toBe(expectedLength)
    } else if (key === 'csMaoassbi') {
      expect(message[0].body.invoiceLines.length).toBe(expectedLength)
    } else {
      expect(message.length).toBe(expectedLength)
    }
  })
})
