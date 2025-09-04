const { POST } = require('../../../../../app/constants/methods')
const {
  SUCCESS,
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  CONFLICT
} = require('../../../../../app/constants/status-codes')

jest.mock('../../../../../app/data')
jest.mock('../../../../../app/storage', () => ({
  getFileChecksum: jest.fn(),
  acceptFile: jest.fn(),
  quarantineFile: jest.fn()
}))
const url = '/manual-upload'
const db = require('../../../../../app/data')
const { getFileChecksum, acceptFile, quarantineFile } = require('../../../../../app/storage')

let server

describe('manual-upload route', () => {
  beforeEach(async () => {
    jest.clearAllMocks()

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
    db.manualUpload.findOne = jest.fn().mockResolvedValue({ filename: 'test.csv' })

    const options = {
      method: POST,
      url,
      payload: { uploader: 'Ollie', filename: 'test.csv' }
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(CONFLICT)
    expect(result.result.code).toBe('DUPLICATE_UPLOAD')
    expect(quarantineFile).toHaveBeenCalledWith('test.csv', 'staging')
  })

  test('POST /manual-upload returns 200 on successful upload', async () => {
    getFileChecksum.mockResolvedValue('xyz789')
    db.manualUpload.findOne = jest.fn().mockResolvedValue(null)
    db.manualUpload.create = jest.fn().mockResolvedValue({})
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
    expect(db.manualUpload.create).toHaveBeenCalledWith(expect.objectContaining({
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
