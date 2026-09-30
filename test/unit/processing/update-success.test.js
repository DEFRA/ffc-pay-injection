const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['manualUploads'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { updateSuccess } = require('../../../app/processing/update-success')

describe('updateSuccess', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves()
  })

  test('updates manualUploads success for the filename', async () => {
    await updateSuccess('testfile.csv', true)

    expect(mockDb.tables.manualUploads).toHaveBeenCalledTimes(1)
    expect(mockDb.builder.where).toHaveBeenCalledWith({ filename: 'testfile.csv' })
    expect(mockDb.builder.update).toHaveBeenCalledWith({ success: true })
  })

  test('propagates error if update rejects', async () => {
    const error = new Error('DB error')
    mockDb.builder.rejects(error)

    await expect(updateSuccess('file.csv', true)).rejects.toThrow(error)
  })
})
