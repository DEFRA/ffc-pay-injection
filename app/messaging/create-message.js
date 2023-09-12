const { PAYMENT } = require('../constants/messages')
const { SOURCE } = require('../constants/source')

const createMessage = (body) => {
  return {
    body,
    type: PAYMENT,
    source: SOURCE
  }
}

module.exports = {
  createMessage
}
