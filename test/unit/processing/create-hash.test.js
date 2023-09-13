const { createHash } = require('../../../app/processing/create-hash')

describe('create hash', () => {
  test('should create hash from string', () => {
    const hash = createHash('test')
    expect(hash).toBe('7C7354F3')
  })
})
