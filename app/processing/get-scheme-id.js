const { isValidSchemeId, getSchemeIdFromPillar } = require('ffc-pay-schemes')

const getSchemeId = (scheme) => {
  if (scheme == null) {
    throw new Error(`Scheme ${scheme} is not recognised`)
  }

  if (isValidSchemeId(scheme)) {
    return scheme
  }

  const schemeIdFromPillar = getSchemeIdFromPillar(scheme)
  if (schemeIdFromPillar) {
    return schemeIdFromPillar
  }

  throw new Error(`Scheme ${scheme} is not recognised`)
}

module.exports = {
  getSchemeId
}
