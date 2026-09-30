const { manualUploads } = require('../database')

const updateSuccess = async (filename, success) => {
  await manualUploads().where({ filename }).update({ success })
}

module.exports = {
  updateSuccess
}
