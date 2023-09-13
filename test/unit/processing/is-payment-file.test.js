const { isPaymentFile } = require('../../../app/processing/is-payment-file')

let filename

describe('is payment file', () => {
  beforeEach(() => {
    filename = 'FFC_Manual_Batch_20230913100000.csv'
  })

  test('should return true when filename is payment batch', () => {
    const result = isPaymentFile(filename)
    expect(result).toBe(true)
  })

  test('Should return false when filename is undefined', () => {
    filename = undefined
    const result = isPaymentFile(filename)
    expect(result).toBe(false)
  })

  test('Should return false when filename is null', () => {
    filename = null
    const result = isPaymentFile(filename)
    expect(result).toBe(false)
  })

  test('Should return false when filename is a number', () => {
    filename = 1
    const result = isPaymentFile(filename)
    expect(result).toBe(false)
  })

  test('Should return false when filename is not a csv file', () => {
    filename = filename.replace('.csv', '.pdf')
    const result = isPaymentFile(filename)
    expect(result).toBe(false)
  })

  test('Should return false when filename is a return file', () => {
    filename = 'Another file type.csv'
    const result = isPaymentFile(filename)
    expect(result).toBe(false)
  })
})
