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

const { BATCH_PROCESSED } = require('../../../app/constants/events')
const { SOURCE } = require('../../../app/constants/source')

const { sendSuccessEvent } = require('../../../app/event/send-success-event')

const filename = 'test.csv'

describe('send success event', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should send event to events topic', async () => {
    await sendSuccessEvent(filename)
    expect(MockEventPublisher.mock.calls[0][0]).toBe(config.eventsTopic)
  })

  test('should raise an event with processing source', async () => {
    await sendSuccessEvent(filename)
    expect(mockPublishEvent.mock.calls[0][0].source).toBe(SOURCE)
  })

  test('should raise acknowledged payment event type', async () => {
    await sendSuccessEvent(filename)
    expect(mockPublishEvent.mock.calls[0][0].type).toBe(BATCH_PROCESSED)
  })
})
