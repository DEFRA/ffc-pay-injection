const util = require('util')
const { archiveFile, downloadFile } = require('../storage')
const { parsePaymentFile } = require('./parse-payment-file')
const { quarantineFile } = require('./quarantine-file')
const { sendPaymentMessages } = require('../messaging')
const { sendSuccessEvent } = require('../event')
const { updateSuccess } = require('./update-success')

const processPaymentFile = async (filename, transaction) => {
  console.info(`Processing payment file: ${filename}`)
  const data = await downloadFile(filename)

  let paymentRequests
  try {
    paymentRequests = await parsePaymentFile(data, filename, transaction)
  } catch (err) {
    await quarantineFile(filename, err)
    await updateSuccess(filename, false)
    throw err
  }

  if (paymentRequests?.length) {
    try {
      await sendPaymentMessages(paymentRequests)
      console.log('Payments published:', util.inspect(paymentRequests, false, null, true))
      await updateSuccess(filename, true)
      await archiveFile(filename)
      await sendSuccessEvent(filename)
    } catch (err) {
      await quarantineFile(filename, err)
      await updateSuccess(filename, false)
      throw err
    }
  }
}

module.exports = {
  processPaymentFile
}
