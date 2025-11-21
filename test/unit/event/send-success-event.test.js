const mockPublishEvent = jest.fn()

const MockEventPublisher = jest.fn(() => ({
  publishEvent: mockPublishEvent
}))

jest.mock('ffc-pay-event-publisher', () => ({
  EventPublisher: MockEventPublisher
}))

jest.mock('../../../app/config')
const config = require('../../../app/config')

const { BATCH_PROCESSED } = require('../../../app/constants/events')
const { SOURCE } = require('../../../app/constants/source')
const { sendSuccessEvent } = require('../../../app/event/send-success-event')

const filename = 'test.csv'

describe('send success event', () => {
  beforeEach(() => jest.clearAllMocks())

  const run = () => sendSuccessEvent(filename)

  test('publishes to configured topic', async () => {
    await run()
    expect(MockEventPublisher).toHaveBeenCalledWith(config.eventsTopic)
  })

  test.each([
    ['source', SOURCE],
    ['type', BATCH_PROCESSED]
  ])('sets %s correctly', async (_, expected) => {
    await run()
    const evt = mockPublishEvent.mock.calls[0][0]

    const actual =
      _.includes('.') ? _.split('.').reduce((a, k) => a[k], evt) : evt[_]

    expect(actual).toBe(expected)
  })
})
