const {
  SUCCESS,
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  CONFLICT
} = require('../../constants/status-codes')

const { POST } = require('../../constants/methods')

const { manualUploads } = require('../../database')
const { getFileChecksum, acceptFile, quarantineFile } = require('../../storage')

module.exports = {
  method: POST,
  path: '/manual-upload',
  options: {
    description: 'Create a manual upload log',
    payload: {
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const { uploader, filename } = request.payload

    if (!uploader || !filename) {
      return h
        .response({
          error: 'Missing required information',
          message:
            'Both your username and the file name must be provided before the upload can continue. Please check your input and try again.',
          code: 'MISSING_FIELDS'
        })
        .code(BAD_REQUEST)
    }

    try {
      const checksum = await getFileChecksum(filename)

      const existingAndSuccessful = await manualUploads()
        .where(function () {
          this.where(function () {
            this.where('success', true).andWhere(function () {
              this.where('filename', filename).orWhere('checksum', checksum)
            })
          }).orWhere(function () {
            this.where('success', false).andWhere('filename', filename)
          })
        })
        .first() ?? null

      if (existingAndSuccessful) {
        await quarantineFile(filename, 'staging')

        return h
          .response({
            error: 'Duplicate upload detected',
            message: `The file "${filename}" has already been uploaded. To prevent accidental reprocessing, it has been moved to the quarantine area. Please ensure you are uploading the correct and most recent file.`,
            code: 'DUPLICATE_UPLOAD'
          })
          .code(CONFLICT)
      }

      await acceptFile(filename)

      await manualUploads().insert({
        uploader,
        filename,
        timeStamp: new Date(),
        checksum
      })

      return h
        .response({
          message: 'Manual upload staged successfully.',
          code: 'UPLOAD_SUCCESS'
        })
        .code(SUCCESS)
    } catch (err) {
      console.error('Manual upload error:', err)

      return h
        .response({
          error: 'Failed to process manual upload',
          message:
            'An unexpected problem occurred while processing your file. Please try again later or contact support if the issue persists.',
          code: 'UPLOAD_ERROR'
        })
        .code(INTERNAL_SERVER_ERROR)
    }
  }
}
