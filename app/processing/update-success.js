const db = require('../data')

const updateSuccess = async (filename, success, transaction) => {
  await db.manualUpload.update(
    { success },
    {
      where: { filename },
      transaction
    }
  )
}

module.exports = {
  updateSuccess
}
