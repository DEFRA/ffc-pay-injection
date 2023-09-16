const storage = require('../storage')
const { sendQuarantineEvent } = require('../event')

const quarantineFile = async (filename, error) => {
  console.error(`Quarantining ${filename}, failed to parse file`, error)
  await sendQuarantineEvent(filename, error)
  return storage.quarantineFile(filename)
}

module.exports = {
  quarantineFile
}
