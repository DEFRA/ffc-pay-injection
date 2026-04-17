const { MessageReceiver } = require('ffc-messaging')
const config = require('../../../app/config')
const { processRetentionMessage } = require('../../../app/messaging/process-retention-message')
const { start, stop } = require('../../../app/messaging')

jest.mock('ffc-messaging')
jest.mock('../../../app/config')
jest.mock('../../../app/messaging/process-retention-message')

describe('Message Receivers Module', () => {
  let mockRetentionSubscribe, mockRetentionClose

  beforeEach(() => {
    jest.clearAllMocks()

    mockRetentionSubscribe = jest.fn().mockResolvedValue()
    mockRetentionClose = jest.fn().mockResolvedValue()

    MessageReceiver.mockImplementation((subscription, action) => {
      return {
        subscribe: mockRetentionSubscribe,
        closeConnection: mockRetentionClose,
        subscription,
        action,
      }
    })

    config.retentionSubscription = 'retention-subscription'
  })

  describe('start', () => {
    test('should instantiate MessageReceiver for retention with correct subscription and action, then subscribe', async () => {
      await start()

      expect(MessageReceiver).toHaveBeenCalledTimes(1)

      const call = MessageReceiver.mock.calls[0]
      expect(call[0]).toBe(config.retentionSubscription)
      expect(typeof call[1]).toBe('function')

      expect(mockRetentionSubscribe).toHaveBeenCalledTimes(1)
    })

    test('should call processRetentionMessage with the message and retentionReceiver when retention message action is triggered', async () => {
      await start()

      const retentionAction = MessageReceiver.mock.calls[0][1]

      const fakeMessage = { id: 'retention1' }
      retentionAction(fakeMessage)

      expect(processRetentionMessage).toHaveBeenCalledWith(fakeMessage, expect.any(Object))
    })

    test('should log readiness message', async () => {
      console.log = jest.fn()

      await start()

      expect(console.log).toHaveBeenCalledWith('Ready to receive retention messages')
    })
  })

  describe('stop', () => {
    test('should call closeConnection on retentionReceiver', async () => {
      await start()

      await stop()

      expect(mockRetentionClose).toHaveBeenCalledTimes(1)
    })
  })
})
