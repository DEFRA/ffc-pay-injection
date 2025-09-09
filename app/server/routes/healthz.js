const { OK } = require('../../constants/ok')
const { GET } = require('../../constants/methods')
const { SUCCESS } = require('../../constants/status-codes')

module.exports = {
  method: GET,
  path: '/healthz',
  handler: (_request, h) => {
    return h.response(OK).code(SUCCESS)
  }
}
