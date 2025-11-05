const prefix = 'FFC_Manual_Batch_'
const schemePart = '(?:[A-Z0-9]+_)?'

const year = String.raw`20\d{2}`
const month = String.raw`(?:0[1-9]|1[0-2])`
const day = String.raw`(?:0[1-9]|[12]\d|3[01])`
const hour = String.raw`(?:[01]\d|2[0-3])`
const minute = String.raw`[0-5]\d`
const second = String.raw`[0-5]\d`

const timestamp12 = String.raw`${year}${month}${day}${hour}${minute}`
const timestamp14 = String.raw`${year}${month}${day}${hour}${minute}${second}`
const timestamp = String.raw`(?:${timestamp14}|${timestamp12})`

const filenameRegex = new RegExp(String.raw`^${prefix}${schemePart}${timestamp}\.csv$`, 'i')

const isPaymentFile = (filename) => {
  if (typeof filename !== 'string') {
    return false
  }
  return filenameRegex.test(filename.trim())
}

module.exports = {
  isPaymentFile
}
