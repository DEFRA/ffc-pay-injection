const { NOT_FOUND } = require('../../app/constants/status-codes')

let storage
let config
let mockContainerClient
let mockBlobClient

describe('storage module', () => {
  beforeAll(() => {
    jest.doMock('@azure/storage-blob', () => {
      mockBlobClient = {
        upload: jest.fn(),
        downloadToBuffer: jest.fn(),
        getProperties: jest.fn(),
        beginCopyFromURL: jest.fn(),
        pollUntilDone: jest.fn(),
        delete: jest.fn(),
        url: 'http://fake-url/blob'
      }

      mockContainerClient = {
        createIfNotExists: jest.fn(),
        getBlockBlobClient: jest.fn().mockReturnValue(mockBlobClient),
        listBlobsFlat: jest.fn()
      }

      const BlobServiceClientMock = jest.fn().mockImplementation(() => ({
        getContainerClient: jest.fn().mockReturnValue(mockContainerClient)
      }))

      BlobServiceClientMock.fromConnectionString = jest.fn().mockReturnValue({
        getContainerClient: jest.fn().mockReturnValue(mockContainerClient)
      })

      return { BlobServiceClient: BlobServiceClientMock }
    })

    jest.doMock('@azure/identity', () => ({
      DefaultAzureCredential: jest.fn().mockImplementation((options) => ({
        type: 'DefaultAzureCredential',
        options
      }))
    }))

    jest.doMock('../../app/utils/create-hash', () => jest.fn().mockReturnValue('fakehash'))
  })

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()

    config = require('../../app/config').storageConfig
    storage = require('../../app/storage')

    // ensure listBlobsFlat is always async iterable
    mockContainerClient.listBlobsFlat.mockImplementation(async function * () {
      yield * []
    })
  })

  test('initialiseContainers creates containers if configured', async () => {
    config.createContainers = true
    await storage.getInboundFileList() // triggers initialiseContainers lazily
    expect(mockContainerClient.createIfNotExists).toHaveBeenCalled()
  })

  test('initialiseFolders uploads placeholder file to all folders', async () => {
    config.createContainers = false
    config.inboundFolder = 'inbound'
    config.archiveFolder = 'archive'
    config.quarantineFolder = 'quarantine'
    config.returnFolder = 'return'
    config.stagingFolder = 'staging'

    await storage.getInboundFileList()
    expect(mockContainerClient.getBlockBlobClient).toHaveBeenCalledWith('inbound/default.txt')
    expect(mockBlobClient.upload).toHaveBeenCalledWith('Placeholder', 'Placeholder'.length)
  })

  test('getInboundFileList returns filenames without folder prefix', async () => {
    config.inboundFolder = 'inbound'
    const files = [{ name: 'inbound/file1.txt' }, { name: 'inbound/file2.csv' }]
    mockContainerClient.listBlobsFlat.mockImplementation(async function * () {
      yield * files
    })

    const result = await storage.getInboundFileList()
    expect(result).toEqual(['file1.txt', 'file2.csv'])
  })

  test('downloadFile downloads file as string', async () => {
    mockBlobClient.downloadToBuffer.mockResolvedValue(Buffer.from('test-content'))
    const result = await storage.downloadFile('file1.txt')
    expect(result).toBe('test-content')
  })

  test('getFileChecksum throws if blob not found', async () => {
    mockBlobClient.getProperties.mockRejectedValue({ statusCode: NOT_FOUND })
    mockBlobClient.downloadToBuffer.mockResolvedValue(Buffer.from('ignored'))

    await expect(storage.getFileChecksum('missing.txt'))
      .rejects.toThrow("File 'missing.txt' does not exist in folder 'staging'")
  })

  test('moveFile copies and deletes on success', async () => {
    mockBlobClient.beginCopyFromURL.mockResolvedValue({
      pollUntilDone: jest.fn().mockResolvedValue({ copyStatus: 'success' })
    })

    await storage.acceptFile('file1.txt')
    expect(mockBlobClient.delete).toHaveBeenCalled()
  })

  test('moveFile throws if copy status failed', async () => {
    mockBlobClient.beginCopyFromURL.mockResolvedValue({
      pollUntilDone: jest.fn().mockResolvedValue({ copyStatus: 'failed' })
    })

    await expect(storage.acceptFile('badfile.txt'))
      .rejects.toThrow('Copy failed with status: failed')
  })

  test('quarantineFile throws on invalid source', () => {
    expect(() => storage.quarantineFile('file.txt', 'invalid'))
      .toThrow('Invalid source folder "invalid" for quarantineFile')
  })

  test('deleteFile calls delete on inbound blob', async () => {
    await storage.deleteFile('deleteme.txt')
    expect(mockBlobClient.delete).toHaveBeenCalled()
  })

  test('getReturnBlobClient delegates to getBlob', async () => {
    const result = await storage.getReturnBlobClient('returnme.txt')
    expect(result).toBe(mockBlobClient)
  })

  test('getFileChecksum downloads buffer and hashes it', async () => {
    const createHash = require('../../app/utils/create-hash')
    mockBlobClient.getProperties.mockResolvedValue({})
    mockBlobClient.downloadToBuffer.mockResolvedValue(Buffer.from('abc'))

    const result = await storage.getFileChecksum('somefile.txt')

    expect(createHash).toHaveBeenCalledWith(Buffer.from('abc'))
    expect(result).toBe('fakehash')
  })
})
