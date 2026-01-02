const db = require('../data')

const updateSuccess = async (filename, success) => {
  await db.manualUpload.update(
    { success },
    {
      where: { filename }
    }
  )
}

module.exports = {
  updateSuccess
}
