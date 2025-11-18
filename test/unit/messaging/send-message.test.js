const mockSendBatchMessages = jest.fn()
const mockCloseConnection = jest.fn()
const MockMessageBatchSender = jest.fn(() => ({
  sendBatchMessages: mockSendBatchMessages,
  closeConnection: mockCloseConnection
}))

jest.mock('ffc-messaging', () => ({
  MessageBatchSender: MockMessageBatchSender
}))

jest.mock('../../../app/messaging/create-message')
const { createMessage: mockCreateMessage } = require('../../../app/messaging/create-message')
const config = require('../../../app/config')
const { sendPaymentMessages } = require('../../../app/messaging/send-payment-message')

const paymentRequest = { schemeId: 1 }
const message = { body: paymentRequest }

describe('sendPaymentMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateMessage.mockReturnValue(message)
  })

  const run = () => sendPaymentMessages([paymentRequest])

  test.each([
    ['creates message from payment request', () => expect(mockCreateMessage).toHaveBeenCalledWith(paymentRequest)],
    ['creates new message sender', () => expect(MockMessageBatchSender).toHaveBeenCalledWith(config.paymentTopic)],
    ['sends created messages', () => expect(mockSendBatchMessages).toHaveBeenCalledWith([message])],
    ['closes connection after sending', () => expect(mockCloseConnection).toHaveBeenCalled()]
  ])('%s', async (_, assertion) => {
    await run()
    assertion()
  })
})
