const descriptions = require('../constants/descriptions')

const getDescription = (code) => {
  const matchedDescription = descriptions[code]
  return matchedDescription ? `${code} - ${matchedDescription}` : code
}

module.exports = {
  getDescription
}
