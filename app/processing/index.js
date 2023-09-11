const db = require('../data')
const config = require('../config')
const { getInboundFileList } = require('../storage')
const { isPaymentFile, processPaymentFile } = require('./payments')

const start = async () => {
  const transaction = await db.sequelize.transaction()
  try {
    await db.lock.findByPk(1, { transaction, lock: true })

    const filenames = await getInboundFileList()

    if (filenames.length > 0) {
      for (const filename of filenames) {
        if (isPaymentFile(filename)) {
          await processPaymentFile(filename)
        }
      }
    }
    await transaction.commit()
  } catch (err) {
    console.error(err)
    await transaction.rollback()
  } finally {
    setTimeout(start, config.processingInterval)
  }
}

module.exports = {
  start
}
