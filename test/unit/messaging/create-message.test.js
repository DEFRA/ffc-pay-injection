const { SOURCE } = require('../../../app/constants/source')
const { PAYMENT } = require('../../../app/constants/messages')

const { createMessage } = require('../../../app/messaging/create-message')

const paymentRequest = {
  schemeId: 1
}

describe('create message', () => {
  test('should create a message with the supplied body', () => {
    const message = createMessage(paymentRequest)
    expect(message.body).toEqual(paymentRequest)
  })

  test('should create a message with the supplied type', () => {
    const message = createMessage(paymentRequest)
    expect(message.type).toEqual(PAYMENT)
  })

  test('should create a message with source', () => {
    const message = createMessage(paymentRequest)
    expect(message.source).toEqual(SOURCE)
  })
})
