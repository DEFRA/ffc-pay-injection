const mockPublishEvent = jest.fn()

const MockEventPublisher = jest.fn(() => ({
  publishEvent: mockPublishEvent
}))

jest.mock('ffc-pay-event-publisher', () => ({
  EventPublisher: MockEventPublisher
}))

jest.mock('../../../app/config')
const config = require('../../../app/config')

const { BATCH_QUARANTINED } = require('../../../app/constants/events')
const { SOURCE } = require('../../../app/constants/source')
const { sendQuarantineEvent } = require('../../../app/event/send-quarantine-event')

const filename = 'test.csv'
const error = { message: 'something went wrong' }

describe('send quarantine event', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const run = () => sendQuarantineEvent(filename, error)

  test('publishes to configured topic', async () => {
    await run()
    expect(MockEventPublisher).toHaveBeenCalledWith(config.eventsTopic)
  })

  test.each([
    ['source', SOURCE],
    ['type', BATCH_QUARANTINED],
    ['data.message', error.message]
  ])('sets %s correctly', async (_, expected) => {
    await run()
    const evt = mockPublishEvent.mock.calls[0][0]

    const actual =
      _.includes('.') ? _.split('.').reduce((a, k) => a[k], evt) : evt[_]

    expect(actual).toBe(expected)
  })
})
