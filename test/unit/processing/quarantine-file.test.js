jest.mock('../../../app/storage')
const blobStorage = require('../../../app/storage')

jest.mock('../../../app/event/send-quarantine-event')
const { sendQuarantineEvent } = require('../../../app/event/send-quarantine-event')

const { quarantineFile } = require('../../../app/processing/quarantine-file')

const filename = 'test.csv'
const error = {
  message: 'Something went wrong'
}

describe('quarantine file', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('should quarantine file', async () => {
    await quarantineFile(filename, error)
    expect(blobStorage.quarantineFile).toHaveBeenCalledWith(filename)
  })

  test('should raise quarantine event', async () => {
    await quarantineFile(filename, error)
    expect(sendQuarantineEvent).toHaveBeenCalledWith(filename, error)
  })
})
