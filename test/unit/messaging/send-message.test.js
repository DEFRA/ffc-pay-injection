jest.mock('../../../app/messaging/service-bus', () => ({
  getSender: jest.fn(),
  sendBatchMessages: jest.fn()
}))

jest.mock('../../../app/config', () => ({
  paymentTopic: { address: 'test-payment-topic' }
}))

jest.mock('../../../app/messaging/create-message')

const { createMessage: mockCreateMessage } = require('../../../app/messaging/create-message')
const serviceBus = require('../../../app/messaging/service-bus')
const config = require('../../../app/config')
const { sendPaymentMessages } = require('../../../app/messaging/send-payment-message')

const paymentRequest = { schemeId: 1 }
const message = { body: paymentRequest }
const mockSender = { name: 'sender' }

describe('sendPaymentMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateMessage.mockReturnValue(message)
    serviceBus.getSender.mockReturnValue(mockSender)
  })

  const run = () => sendPaymentMessages([paymentRequest])

  test.each([
    ['creates message from payment request', () => expect(mockCreateMessage).toHaveBeenCalledWith(paymentRequest)],
    ['gets sender for payment topic', () => expect(serviceBus.getSender).toHaveBeenCalledWith(config.paymentTopic)],
    ['sends created messages', () => expect(serviceBus.sendBatchMessages).toHaveBeenCalledWith(mockSender, [message])]
  ])('%s', async (_, assertion) => {
    await run()
    assertion()
  })
})
