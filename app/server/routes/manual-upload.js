const { SUCCESS, BAD_REQUEST, INTERNAL_SERVER_ERROR, CONFLICT } = require('../../constants/http-status-codes')
const db = require('../../data')
const { getFileChecksum, acceptFile, quarantineFile } = require('../../storage')

module.exports = {
  method: 'POST',
  path: '/manual-upload',
  options: {
    payload: {
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const { uploader, filename } = request.payload

    if (!uploader || !filename) {
      return h.response({ error: 'username and filename are required' }).code(BAD_REQUEST)
    }

    try {
      const checksum = await getFileChecksum(filename)

      const existing = await db.manualUpload.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            { filename },
            { checksum }
          ]
        }
      })

      if (existing) {
        await quarantineFile(filename, 'staging')

        return h
          .response({ error: 'Duplicate file detected. File has been quarantined.' })
          .code(CONFLICT)
      }

      await acceptFile(filename)

      await db.manualUpload.create({
        uploader,
        filename,
        timeStamp: new Date(),
        checksum
      })

      return h.response({ message: 'Manual upload staged successfully.' }).code(SUCCESS)
    } catch (err) {
      console.error('Manual upload error:', err)
      return h.response({ error: `Failed to process manual upload. ${err.message}` }).code(INTERNAL_SERVER_ERROR)
    }
  }
}
