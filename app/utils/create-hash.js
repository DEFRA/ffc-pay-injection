const crypto = require('crypto')

const createHash = (content) => {
  return crypto.createHash('sha256').update(content).digest('hex')
}

module.exports = createHash
