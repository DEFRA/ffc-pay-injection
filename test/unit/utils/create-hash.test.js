const createHash = require('../../../app/utils/create-hash')
const crypto = require('crypto')

describe('createHash', () => {
  test('returns correct sha256 hash for given string', () => {
    const input = 'hello world'
    const expected = crypto.createHash('sha256').update(input).digest('hex')

    const result = createHash(input)
    expect(result).toBe(expected)
  })

  test('produces different hash for different input', () => {
    const hash1 = createHash('first')
    const hash2 = createHash('second')

    expect(hash1).not.toBe(hash2)
  })

  test('always returns 64 character hex string', () => {
    const hash = createHash('anything')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })
})
