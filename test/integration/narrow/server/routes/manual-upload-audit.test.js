const { GET } = require('../../../../../app/constants/methods')
const { SUCCESS, NOT_FOUND, INTERNAL_SERVER_ERROR } = require('../../../../../app/constants/status-codes')
const db = require('../../../../../app/data')

jest.mock('../../../../../app/data')

let server

describe('manual-upload-audit route', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    const { createServer } = require('../../../../../app/server/create-server')
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('GET /manual-upload-audit returns 200 with uploads', async () => {
    const mockUploads = [
      { uploadId: 1, filename: 'test.csv', uploader: 'bob', timeStamp: new Date(), checksum: 'abc123' },
      { uploadId: 2, filename: 'data.csv', uploader: 'alice', timeStamp: new Date(), checksum: 'def456' }
    ]
    db.manualUpload.findAll.mockResolvedValue(mockUploads)

    const options = {
      method: GET,
      url: '/manual-upload-audit?from=2025-10-01&to=2025-10-13'
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(SUCCESS)
    expect(result.result).toEqual(mockUploads)
    expect(db.manualUpload.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        timeStamp: expect.any(Object)
      }),
      order: [['timeStamp', 'DESC']]
    }))
  })

  test('GET /manual-upload-audit returns 404 if no uploads found', async () => {
    db.manualUpload.findAll.mockResolvedValue([])

    const options = {
      method: GET,
      url: '/manual-upload-audit?from=2025-10-01&to=2025-10-13'
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(NOT_FOUND)
    expect(result.result.message).toContain('No manual uploads found between')
  })

  test('GET /manual-upload-audit returns 500 if an error occurs', async () => {
    db.manualUpload.findAll.mockRejectedValue(new Error('DB failure'))

    const options = {
      method: GET,
      url: '/manual-upload-audit?from=2025-10-01&to=2025-10-13'
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(INTERNAL_SERVER_ERROR)
    expect(result.result.message).toBe('An internal server error occurred')
  })

  test('GET /manual-upload-audit returns 400 if from/to missing', async () => {
    const options = {
      method: GET,
      url: '/manual-upload-audit?from=2025-10-01' // missing to
    }

    const result = await server.inject(options)
    expect(result.statusCode).toBe(400)
    expect(result.result.message).toContain('Invalid request query input')
  })
})
