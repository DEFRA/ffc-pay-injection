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
    mockDb.builder.returning.mockResolvedValue([{ uploadId: 1 }])

    const { createServer } = require('../../../../../app/server/create-server')
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    jest.restoreAllMocks()
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
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    getFileChecksum.mockResolvedValue('abc123')
    mockDb.builder.resolves({ filename: 'test.csv', success: true })

    const options = {
      method: POST,
      url,
      payload: { uploader: 'Ollie', filename: 'test.csv' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(CONFLICT)
    expect(result.result.code).toBe('DUPLICATE_UPLOAD')
    expect(warn).toHaveBeenCalledWith('Duplicate manual upload detected', { filename: 'test.csv' })
    expect(quarantineFile).toHaveBeenCalledWith('test.csv', 'staging')
    expect(acceptFile).not.toHaveBeenCalled()
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
    expect(mockDb.builder.where).toHaveBeenCalledWith('filename', 'good.csv')
    expect(mockDb.builder.where).toHaveBeenCalledWith('checksum', 'xyz789')
    expect(mockDb.builder.andWhere).toHaveBeenCalledWith('success', true)
    expect(mockDb.builder.insert).toHaveBeenCalledWith(expect.objectContaining({
      uploader: 'charlie',
      filename: 'good.csv',
      checksum: 'xyz789'
    }))
  })

  test('POST /manual-upload returns 409 without moving the blob if another request reserves the filename', async () => {
    getFileChecksum.mockResolvedValue('xyz789')
    mockDb.builder.returning.mockResolvedValue([])

    const result = await server.inject({
      method: POST,
      url,
      payload: { uploader: 'charlie', filename: 'race.csv' }
    })

    expect(result.statusCode).toBe(CONFLICT)
    expect(result.result.code).toBe('DUPLICATE_UPLOAD')
    expect(mockDb.builder.onConflict).toHaveBeenCalledWith('filename')
    expect(acceptFile).not.toHaveBeenCalled()
    expect(quarantineFile).not.toHaveBeenCalled()
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
