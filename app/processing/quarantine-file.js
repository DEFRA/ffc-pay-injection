const storage = require('../storage')
const { sendQuarantineEvent } = require('../event')

const quarantineFile = async (filename, error) => {
  console.info(`Quarantining ${filename}, failed to parse file.`)
  await sendQuarantineEvent(filename, error)
  return storage.quarantineFile(filename)
}

module.exports = {
  quarantineFile
}
