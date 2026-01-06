jest.mock('../../../app/data')

const db = require('../../../app/data')
const { updateSuccess } = require('../../../app/processing/update-success')

describe('updateSuccess', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    db.manualUpload = {
      update: jest.fn().mockResolvedValue()
    }
  })

  test('calls db.manualUpload.update with correct parameters', async () => {
    const filename = 'testfile.csv'
    const success = true

    await updateSuccess(filename, success)

    expect(db.manualUpload.update).toHaveBeenCalledWith(
      { success },
      { where: { filename } }
    )
  })

  test('propagates error if db.manualUpload.update rejects', async () => {
    const error = new Error('DB error')
    db.manualUpload.update.mockRejectedValue(error)

    await expect(updateSuccess('file.csv', true)).rejects.toThrow(error)
  })
})
