const { OK } = require('../../constants/ok')
const { OK: statusOK } = require('../../constants/http-status-codes')

module.exports = {
  method: 'GET',
  path: '/healthy',
  handler: (_request, h) => {
    return h.response(OK).code(statusOK)
  }
}
