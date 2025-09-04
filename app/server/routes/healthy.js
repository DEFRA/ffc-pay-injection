const { OK } = require('../../constants/ok')
const { SUCCESS } = require('../../constants/status-codes')

module.exports = {
  method: 'GET',
  path: '/healthy',
  handler: (_request, h) => {
    return h.response(OK).code(SUCCESS)
  }
}
