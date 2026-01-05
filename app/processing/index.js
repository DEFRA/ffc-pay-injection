const db = require('../data')
const config = require('../config')
const { getInboundFileList } = require('../storage')
const { isPaymentFile } = require('./is-payment-file')
const { processPaymentFile } = require('./process-payment-file')

const start = async () => {
  try {
    const dbLockTransaction = await db.sequelize.transaction()
    await db.lock.findByPk(1, { transaction: dbLockTransaction, lock: true })
    await dbLockTransaction.commit()

    const filenames = await getInboundFileList()

    for (const filename of filenames) {
      if (!isPaymentFile(filename)) {
        continue
      }

      const transaction = await db.sequelize.transaction()
      try {
        await processPaymentFile(filename, transaction)
        await transaction.commit()
      } catch (err) {
        console.error(`Failed to process ${filename}:`, err)
        await transaction.rollback()
      }
    }
  } catch (err) {
    console.error('Unexpected error in processing loop:', err)
  } finally {
    setTimeout(start, config.processingInterval)
  }
}


module.exports = {
  start
}
