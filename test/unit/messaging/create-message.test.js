const { SOURCE } = require('../../../app/constants/source')
const { PAYMENT } = require('../../../app/constants/messages')
const { createMessage } = require('../../../app/messaging/create-message')

const paymentRequest = { schemeId: 1 }

describe('createMessage', () => {
  const message = createMessage(paymentRequest)

  test.each([
    ['body', paymentRequest, msg => msg.body],
    ['type', PAYMENT, msg => msg.type],
    ['source', SOURCE, msg => msg.source]
  ])('sets %s correctly', (_, expected, extractor) => {
    expect(extractor(message)).toEqual(expected)
  })
})
