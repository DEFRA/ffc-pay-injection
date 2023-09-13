const mockPublishEvent = jest.fn()

const MockEventPublisher = jest.fn().mockImplementation(() => {
  return {
    publishEvent: mockPublishEvent
  }
})

jest.mock('ffc-pay-event-publisher', () => {
  return {
    EventPublisher: MockEventPublisher
  }
})

jest.mock('../../../app/config')
const config = require('../../../app/config')

const { BATCH_QUARANTINED } = require('../../../app/constants/events')
const { SOURCE } = require('../../../app/constants/source')

const { sendQuarantineEvent } = require('../../../app/event/send-quarantine-event')

const filename = 'test.csv'
const error = {
  message: 'something went wrong'
}

describe('send quarantine event', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should send event to V2 topic', async () => {
    await sendQuarantineEvent(filename, error)
    expect(MockEventPublisher.mock.calls[0][0]).toBe(config.eventsTopic)
  })

  test('should raise an event with processing source', async () => {
    await sendQuarantineEvent(filename, error)
    expect(mockPublishEvent.mock.calls[0][0].source).toBe(SOURCE)
  })

  test('should raise acknowledged payment event type', async () => {
    await sendQuarantineEvent(filename, error)
    expect(mockPublishEvent.mock.calls[0][0].type).toBe(BATCH_QUARANTINED)
  })

  test('should include error message in event data', async () => {
    await sendQuarantineEvent(filename, error)
    expect(mockPublishEvent.mock.calls[0][0].data.message).toBe(error.message)
  })
})
