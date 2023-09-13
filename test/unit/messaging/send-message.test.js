const mockSendBatchMessages = jest.fn()
const mockCloseConnection = jest.fn()
const MockMessageBatchSender = jest.fn().mockImplementation(() => {
  return {
    sendBatchMessages: mockSendBatchMessages,
    closeConnection: mockCloseConnection
  }
})

jest.mock('ffc-messaging', () => {
  return {
    MessageBatchSender: MockMessageBatchSender
  }
})

jest.mock('../../../app/messaging/create-message')
const { createMessage: mockCreateMessage } = require('../../../app/messaging/create-message')

const config = require('../../../app/config')

const { sendPaymentMessages } = require('../../../app/messaging/send-payment-message')

const paymentRequest = {
  schemeId: 1
}

const message = {
  body: paymentRequest
}

describe('send message', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockCreateMessage.mockReturnValue(message)
  })

  test('should create message from payment request and type', async () => {
    await sendPaymentMessages([paymentRequest])
    expect(mockCreateMessage).toHaveBeenCalledWith(paymentRequest)
  })

  test('should create new message sender', async () => {
    await sendPaymentMessages([paymentRequest])
    expect(MockMessageBatchSender).toHaveBeenCalledWith(config.paymentTopic)
  })

  test('should send created messages', async () => {
    await sendPaymentMessages([paymentRequest])
    expect(mockSendBatchMessages).toHaveBeenCalledWith([message])
  })

  test('should close connection after sending', async () => {
    await sendPaymentMessages([paymentRequest])
    expect(mockCloseConnection).toHaveBeenCalled()
  })
})
