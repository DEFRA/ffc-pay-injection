const { isPaymentFile } = require('../../../app/processing/is-payment-file')

describe('isPaymentFile', () => {
  const cases = [
    ['valid payment batch filename', 'FFC_Manual_Batch_20230913100000.csv', true],
    ['undefined filename', undefined, false],
    ['null filename', null, false],
    ['numeric filename', 1, false],
    ['non-csv filename', 'FFC_Manual_Batch_20230913100000.pdf', false],
    ['return file', 'Another file type.csv', false]
  ]

  test.each(cases)('%s', (_, filename, expected) => {
    expect(isPaymentFile(filename)).toBe(expected)
  })
})
