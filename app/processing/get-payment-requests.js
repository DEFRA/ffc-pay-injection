const { convertToPence } = require('../currency-convert')
const { getDescription } = require('./get-description')
const { getSchemeId } = require('./get-scheme-id')

const getPaymentRequests = (csv) => {
  return [...csv.filter(x => x).reduce((x, y) => {
    const values = y.split(',')
    const schemeId = getSchemeId(values[0])
    const key = `${schemeId}-${values[1]}-${values[2]}-${values[3]}`

    // if key doesn't exist then first instance so create new group
    const item = x.get(key) || ({
      schemeId,
      frn: values[1],
      marketingYear: values[2],
      agreementNumber: values[3],
      dueDate: values[7],
      schedule: values[8],
      invoiceLines: [],
      value: 0
    })
    item.value += convertToPence(values[6])
    item.invoiceLines.push({
      schemeCode: values[4],
      description: getDescription(values[5]),
      value: values[6]
    })

    return x.set(key, item)
  }, new Map()).values()]
}

module.exports = {
  getPaymentRequests
}