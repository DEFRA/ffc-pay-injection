jest.mock('../../../app/messaging/service-bus', () => ({
  createServiceBusClient: jest.fn(),
  createReceiver: jest.fn(),
  subscribeReceiver: jest.fn(),
  closeSenders: jest.fn()
}))

jest.mock('../../../app/config', () => ({
  env: 'test',
  retentionSubscription: { address: 'test-subscription', topic: 'test-topic' }
}))

jest.mock('../../../app/messaging/process-retention-message', () => ({
  processRetentionMessage: jest.fn()
}))

const config = require('../../../app/config')
const serviceBus = require('../../../app/messaging/service-bus')
const { processRetentionMessage } = require('../../../app/messaging/process-retention-message')
const { start, stop } = require('../../../app/messaging')

describe('Message Receivers Module', () => {
  let mockSbClient
  let mockRetentionReceiver

  beforeEach(() => {
    jest.clearAllMocks()

    mockSbClient = { close: jest.fn().mockResolvedValue() }
    mockRetentionReceiver = {
      close: jest.fn().mockResolvedValue()
    }

    serviceBus.createServiceBusClient.mockReturnValue(mockSbClient)
    serviceBus.createReceiver.mockReturnValue(mockRetentionReceiver)
    serviceBus.subscribeReceiver.mockReturnValue()
    serviceBus.closeSenders.mockResolvedValue()
  })

  describe('start', () => {
    test('should create Service Bus client and receiver for retention subscription, then subscribe', async () => {
      await start()

      expect(serviceBus.createServiceBusClient).toHaveBeenCalledTimes(1)
      expect(serviceBus.createServiceBusClient).toHaveBeenCalledWith(config.retentionSubscription)

      expect(serviceBus.createReceiver).toHaveBeenCalledTimes(1)
      expect(serviceBus.createReceiver).toHaveBeenCalledWith(mockSbClient, config.retentionSubscription)

      expect(serviceBus.subscribeReceiver).toHaveBeenCalledTimes(1)
      expect(serviceBus.subscribeReceiver).toHaveBeenCalledWith(mockRetentionReceiver, expect.any(Function))
    })

    test('should call processRetentionMessage with the message and retentionReceiver when retention message action is triggered', async () => {
      await start()

      const retentionAction = serviceBus.subscribeReceiver.mock.calls[0][1]

      const fakeMessage = { id: 'retention1' }
      retentionAction(fakeMessage)

      expect(processRetentionMessage).toHaveBeenCalledWith(fakeMessage, mockRetentionReceiver)
    })

    test('should log readiness message', async () => {
      console.log = jest.fn()

      await start()

      expect(console.log).toHaveBeenCalledWith('Ready to receive retention messages')
    })
  })

  describe('stop', () => {
    test('should close retentionReceiver, Service Bus client and senders', async () => {
      await start()

      await stop()

      expect(mockRetentionReceiver.close).toHaveBeenCalledTimes(1)
      expect(mockSbClient.close).toHaveBeenCalledTimes(1)
      expect(serviceBus.closeSenders).toHaveBeenCalledTimes(1)
    })

    test('should continue stopping when retentionReceiver close fails', async () => {
      mockRetentionReceiver.close.mockRejectedValue(new Error('close failed'))
      console.error = jest.fn()

      await start()
      await stop()

      expect(console.error).toHaveBeenCalledWith('Error closing retention receiver:', expect.any(Error))
      expect(serviceBus.closeSenders).toHaveBeenCalledTimes(1)
    })
  })
})
