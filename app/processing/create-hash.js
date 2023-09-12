const createHash = (value) => {
  let hash = 5381
  let index = value.length

  while (index) {
    hash = (hash * 33) ^ value.charCodeAt(--index)
  }

  return (hash >>> 0).toString(16).toUpperCase()
}

module.exports = {
  createHash
}
