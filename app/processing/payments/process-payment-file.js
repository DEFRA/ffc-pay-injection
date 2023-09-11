const { archiveFile } = require('../../storage')

const processPaymentFile = async (filename) => {
  console.info(`Processing payment file: ${filename}`)
  try {
    await archiveFile(filename)
  } catch (err) {
    console.error(`Failed to process payment file: ${filename}`, err)
  }
}

module.exports = {
  processPaymentFile
}
