const descriptions = require('../../../app/constants/descriptions')

const { getDescription } = require('../../../app/processing/get-description')

describe('get description', () => {
  test.each(
    Object.keys(descriptions)
  )('should return full description for each known code', (code) => {
    const result = getDescription(code)
    expect(result.startsWith(`${code} -`)).toBeTruthy()
  })

  test('should return code as is for unknown code', () => {
    const result = getDescription('XY1')
    expect(result).toBe('XY1')
  })
})
