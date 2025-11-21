const { convertToPence, convertToPounds } = require('../../app/currency-convert')

describe('currency conversion', () => {
  describe('convertToPence', () => {
    test.each([
      [100, 10000],
      [100.10, 10010],
      [100.1, 10010],
      ['100', 10000],
      ['100.10', 10010],
      ['100.1', 10010]
    ])('converts %p to %p pence', (input, expected) => {
      expect(convertToPence(input)).toBe(expected)
    })
  })

  describe('convertToPounds', () => {
    test.each([
      [10000, '100.00'],
      [10010, '100.10']
    ])('converts %p to %p pounds', (input, expected) => {
      expect(convertToPounds(input)).toBe(expected)
    })
  })
})
