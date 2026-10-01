const db = require('../database')
const config = require('../config')
const { getInboundFileList } = require('../storage')
const { isPaymentFile } = require('./is-payment-file')
const { processPaymentFile } = require('./process-payment-file')

const start = async () => {
  try {
    const dbLockTransaction = await db.transaction()
    await db.locks(dbLockTransaction ?? undefined).where({ lockId: 1 }).forUpdate().first()
    await dbLockTransaction.commit()

    const filenames = await getInboundFileList()

    for await (const filename of filenames) {
      if (!isPaymentFile(filename)) {
        continue
      }

      const transaction = await db.transaction()
      try {
        await processPaymentFile(filename, transaction)
        await transaction.commit()
      } catch (err) {
        console.error(`Failed to process ${filename}, rolling back database transaction.`, err)
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
