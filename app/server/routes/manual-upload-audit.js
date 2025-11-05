const Boom = require('@hapi/boom')
const Joi = require('joi')
const { Op } = require('sequelize')
const db = require('../../data')
const { SUCCESS } = require('../../constants/status-codes')

const START_OF_DAY = { hours: 0, minutes: 0, seconds: 0, ms: 0 }
const END_OF_DAY = { hours: 23, minutes: 59, seconds: 59, ms: 999 }

module.exports = {
  method: 'GET',
  path: '/manual-upload-audit',
  options: {
    description: 'Get manual uploads between two dates',
    validate: {
      query: Joi.object({
        from: Joi.date().required(),
        to: Joi.date().required()
      })
    }
  },
  handler: async (request, h) => {
    try {
      const { from, to } = request.query

      const fromDate = new Date(from)
      fromDate.setHours(START_OF_DAY.hours, START_OF_DAY.minutes, START_OF_DAY.seconds, START_OF_DAY.ms)

      const toDate = new Date(to)
      toDate.setHours(END_OF_DAY.hours, END_OF_DAY.minutes, END_OF_DAY.seconds, END_OF_DAY.ms)

      const uploads = await db.manualUpload.findAll({
        where: {
          timeStamp: {
            [Op.between]: [new Date(fromDate), new Date(toDate)]
          }
        },
        order: [['timeStamp', 'DESC']]
      })

      if (!uploads || uploads.length === 0) {
        const fromFormatted = new Date(from).toLocaleDateString('en-UK')
        const toFormatted = new Date(to).toLocaleDateString('en-UK')

        throw Boom.notFound(
          `No manual uploads found between ${fromFormatted} and ${toFormatted}`
        )
      }

      return h.response(uploads).code(SUCCESS)
    } catch (err) {
      console.error(err)
      if (Boom.isBoom(err)) {
        throw err
      }
      throw Boom.internal('Failed to fetch manual uploads')
    }
  }
}
