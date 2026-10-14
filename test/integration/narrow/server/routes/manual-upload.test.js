const { POST } = require('../../../../../app/constants/methods')
const {
  SUCCESS,
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  CONFLICT
} = require('../../../../../app/constants/status-codes')

const { createKnexMock } = require('../../../../helpers/mock-knex')

const mockDb = createKnexMock(['manualUploads'])

jest.mock('../../../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))
jest.mock('../../../../../app/storage', () => ({
  getFileChecksum: jest.fn(),
  acceptFile: jest.fn(),
  quarantineFile: jest.fn()
}))
const url = '/manual-upload'
const { getFileChecksum, acceptFile, quarantineFile } = require('../../../../../app/storage')

let server

describe('manual-upload route', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    mockDb.builder.resolves()

    const { createServer } = require('../../../../../app/server/create-server')
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('POST /manual-upload returns 400 if uploader or filename missing', async () => {
    const options = {
      method: POST,
      url,
      payload: { uploader: 'bob' } // missing filename
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(BAD_REQUEST)
    expect(result.result.code).toBe('MISSING_FIELDS')
  })

  test('POST /manual-upload returns 409 if duplicate upload detected', async () => {
    getFileChecksum.mockResolvedValue('abc123')
    mockDb.builder.resolves({ filename: 'test.csv' })

    const options = {
      method: POST,
      url,
      payload: { uploader: 'Ollie', filename: 'test.csv' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(CONFLICT)
    expect(result.result.code).toBe('DUPLICATE_UPLOAD')
    expect(quarantineFile).toHaveBeenCalledWith('test.csv', 'staging')
    expect(mockDb.builder.insert).not.toHaveBeenCalled()
  })

  test('POST /manual-upload returns 200 on successful upload', async () => {
    getFileChecksum.mockResolvedValue('xyz789')
    mockDb.builder.resolves(undefined)
    acceptFile.mockResolvedValue()

    const options = {
      method: POST,
      url,
      payload: { uploader: 'charlie', filename: 'good.csv' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(SUCCESS)
    expect(result.result.code).toBe('UPLOAD_SUCCESS')
    expect(acceptFile).toHaveBeenCalledWith('good.csv')
    expect(mockDb.builder.where).toHaveBeenCalledWith('success', true)
    expect(mockDb.builder.where).toHaveBeenCalledWith('filename', 'good.csv')
    expect(mockDb.builder.orWhere).toHaveBeenCalledWith('checksum', 'xyz789')
    expect(mockDb.builder.where).toHaveBeenCalledWith('success', false)
    expect(mockDb.builder.insert).toHaveBeenCalledWith(expect.objectContaining({
      uploader: 'charlie',
      filename: 'good.csv',
      checksum: 'xyz789'
    }))
  })

  test('POST /manual-upload returns 500 if an unexpected error occurs', async () => {
    getFileChecksum.mockRejectedValue(new Error('disk read failure'))

    const options = {
      method: POST,
      url,
      payload: { uploader: 'dave', filename: 'bad.csv' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(INTERNAL_SERVER_ERROR)
    expect(result.result.code).toBe('UPLOAD_ERROR')
  })
})
