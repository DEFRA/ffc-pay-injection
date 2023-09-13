const descriptions = require('../constants/description')

const getDescription = (code) => {
  const matchedDescription = descriptions[code]
  return matchedDescription ? `${code} - ${matchedDescription}` : code
}

module.exports = {
  getDescription
}
