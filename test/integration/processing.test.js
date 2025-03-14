jest.useFakeTimers()

const mockSendBatchMessages = jest.fn()
jest.mock('ffc-messaging', () => {
  return {
    MessageBatchSender: jest.fn().mockImplementation(() => {
      return {
        sendBatchMessages: mockSendBatchMessages,
        closeConnection: jest.fn()
      }
    })
  }
})

const mockPublishEvent = jest.fn()
const mockPublishEvents = jest.fn()

const MockEventPublisher = jest.fn().mockImplementation(() => {
  return {
    publishEvent: mockPublishEvent,
    publishEvents: mockPublishEvents
  }
})

jest.mock('ffc-pay-event-publisher', () => {
  return {
    EventPublisher: MockEventPublisher
  }
})

const path = require('path')
const { BlobServiceClient } = require('@azure/storage-blob')

const db = require('../../app/data')
const storageConfig = require('../../app/config/storage')

const { start } = require('../../app/processing')

const { BATCH_QUARANTINED, BATCH_PROCESSED } = require('../../app/constants/events')
const { GBP } = require('../../app/constants/currency')
const { MANUAL } = require('../../app/constants/schemes')
const { AP, AR } = require('../../app/constants/ledgers')

const filename = 'FFC_Manual_Batch_20201001.csv'
const minimalFilepath = path.resolve(__dirname, '../files', 'minimal.csv')
const multiLineFilepath = path.resolve(__dirname, '../files', 'multi-line.csv')
const multiPaymentFilepath = path.resolve(__dirname, '../files', 'multi-payment.csv')
const scheduleFilepath = path.resolve(__dirname, '../files', 'schedule.csv')
const manualFilepath = path.resolve(__dirname, '../files', 'manual.csv')
const manualLedgerFilepath = path.resolve(__dirname, '../files', 'manual-ledger.csv')
const manualLedgerRecoveryFilepath = path.resolve(__dirname, '../files', 'manual-ledger-recovery.csv')
const csFilePath = path.resolve(__dirname, '../files', 'cs.csv')
const csMaoassbiFilePath = path.resolve(__dirname, '../files', 'cs-maoassbi.csv')
const quotesFilepath = path.resolve(__dirname, '../files', 'quotes.csv')

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

  test('sends payment request for file with minimal data', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0].length).toBe(1)
  })

  test('sends payment request for file with scheme id', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.schemeId).toBe(1)
  })

  test('sends payment request for file with frn', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.frn).toBe('1000000001')
  })

  test('sends payment request for file with payment request number as 0', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.paymentRequestNumber).toBe(0)
  })

  test('sends payment request for file with correlation id', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.correlationId).toBeDefined()
  })

  test('sends payment request for file with contract number', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.contractNumber).toBe('Z00000001')
  })

  test('sends payment request for file with contract number', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.contractNumber).toBe('Z00000001')
  })

  test('sends payment request for file with currency', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.currency).toBe(GBP)
  })

  test('sends payment request for file with due date', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.dueDate).toBe('2023-10-01')
  })

  test('sends payment request with value', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.value).toBe('250.00')
  })

  test('sends payment request with invoice number', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceNumber.endsWith('Z00000001V000')).toBe(true)
  })

  test('sends payment request with AP ledger if not supplied', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.ledger.endsWith(AP)).toBe(true)
  })

  test('sends payment request with invoice lines', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceLines.length).toBe(1)
  })

  test('sends payment request with invoice line description', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceLines[0].description).toBe('G00 - Gross value of claim')
  })

  test('sends payment request with invoice line scheme code', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceLines[0].schemeCode).toBe('80201')
  })

  test('sends payment request with invoice line value', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceLines[0].value).toBe('250.00')
  })

  test('archives file on success', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.archiveFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.archiveFolder}/${filename}`).length).toBe(1)
  })

  test('ignores unrelated file', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inbound}/ignore me.dat`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    const fileList = []
    for await (const item of container.listBlobsFlat()) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.inbound}/ignore me.dat`).length).toBe(1)
  })

  test('quarantines invalid file', async () => {
    const invalidContent = 'invalid'

    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.upload(invalidContent, invalidContent.length)

    await start()

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: storageConfig.quarantineFolder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${storageConfig.quarantineFolder}/${filename}`).length).toBe(1)
  })

  test('sends quarantined event when quarantined', async () => {
    const invalidContent = 'invalid'

    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.upload(invalidContent, invalidContent.length)

    await start()

    expect(mockPublishEvent.mock.calls[0][0].type).toBe(BATCH_QUARANTINED)
  })

  test('sends processed event when quarantined', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(minimalFilepath)

    await start()

    expect(mockPublishEvent.mock.calls[0][0].type).toBe(BATCH_PROCESSED)
  })

  test('sends payment request with multiple invoice lines', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(multiLineFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceLines.length).toBe(3)
  })

  test('sends payment request with multiple payment requests', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(multiPaymentFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0].length).toBe(2)
  })

  test('sends payment request with schedule number', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(scheduleFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.schedule).toBe('Q4')
  })

  test('sends payment request with account code', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(manualFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceLines[0].accountCode).toBe('SOS270')
  })

  test('sends payment request with scheme id for manual', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(manualFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.schemeId).toBe(MANUAL)
  })

  test('sends payment request with pillar for manual', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(manualFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.pillar).toBe('SFI')
  })

  test('sends payment request with AP ledger if not supplied for manual', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(manualFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.ledger).toBe(AP)
  })

  test('sends payment request with ledger supplied for manual', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(manualLedgerFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.ledger).toBe(AR)
  })

  test('sends payment request with debt type to lower case for manual', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(manualLedgerRecoveryFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.debtType).toBe('adm')
  })

  test('sends payment request with recovery date for manual', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(manualLedgerRecoveryFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.recoveryDate).toBe('2023-10-01')
  })

  test('sends payment request with original invoice number for manual', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(manualLedgerRecoveryFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.originalInvoiceNumber).toBe('S123456789C123456V001')
  })

  test('sends payment request with original settlement date for manual', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(manualLedgerRecoveryFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.originalSettlementDate).toBe('2023-10-01')
  })

  test('sends payment request with fund code supplied for manual', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(csFilePath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceLines[0].fundCode).toBe('DRD10')
  })

  test('sends payment request with delivery body supplied for manual', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(csFilePath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceLines[0].deliveryBody).toBe('NE00')
  })

  test('sends payment request with agreement number supplied for manual', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(csFilePath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceLines[0].agreementNumber).toBe('A01000000001/MT')
  })

  test('sends payment request with agreement number at payment request level, if supplied for invoice lines', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(csFilePath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.agreementNumber).toBe('A01000000001/MT')
  })

  test('sends payment request with multiple agreements on a single sbi claim (MAOASSBI)', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(csMaoassbiFilePath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceLines.length).toBe(2)
    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceLines[0].agreementNumber).toBe('A01000000001/MT')
    expect(mockSendBatchMessages.mock.calls[0][0][0].body.invoiceLines[1].agreementNumber).toBe('A01000000002/MT')
  })

  test('sends payment request for file with quotes', async () => {
    const blockBlobClient = container.getBlockBlobClient(`${storageConfig.inboundFolder}/${filename}`)
    await blockBlobClient.uploadFile(quotesFilepath)

    await start()

    expect(mockSendBatchMessages.mock.calls[0][0].length).toBe(1)
  })
})
