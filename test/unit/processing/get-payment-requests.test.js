const { getPaymentRequests } = require('../../../app/processing/get-payment-requests')
const { getSchemeId } = require('../../../app/processing/get-scheme-id')
const { convertToPence } = require('../../../app/currency-convert')
const { getDescription } = require('../../../app/processing/get-description')

jest.mock('../../../app/processing/get-scheme-id')
jest.mock('../../../app/currency-convert')
jest.mock('../../../app/processing/get-description')

describe('getPaymentRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should group payment requests correctly', () => {
    const csv = [
      'S1,1234567890,2021,CN123,SCH123,Descr,1000,2021-01-01,Q4,ACC1,AP,adm,'
    ]
    getSchemeId.mockReturnValue(1)
    convertToPence.mockReturnValue(100000)
    getDescription.mockReturnValue('Description')

    const result = getPaymentRequests(csv)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      schemeId: 1,
      frn: '1234567890',
      marketingYear: '2021',
      contractNumber: 'CN123',
      dueDate: '2021-01-01',
      schedule: 'Q4',
      ledger: 'AP',
      debtType: 'adm',
      recoveryDate: undefined,
      originalInvoiceNumber: undefined,
      originalSettlementDate: undefined,
      pillar: undefined,
      invoiceLines: [
        {
          schemeCode: 'SCH123',
          description: 'Description',
          value: '1000',
          accountCode: 'ACC1',
          fundCode: undefined,
          deliveryBody: undefined,
          agreementNumber: undefined
        }
      ],
      value: 100000
    })
  })

  test('should handle empty CSV input', () => {
    const csv = []

    const result = getPaymentRequests(csv)

    expect(result).toEqual([])
  })

  test('should handle CSV with empty lines', () => {
    const csv = [
      '',
      'S1,1234567890,2021,CN123,SCH123,Descr,1000,2021-01-01,Q4,ACC1,AP,adm,',
      ''
    ]
    getSchemeId.mockReturnValue(1)
    convertToPence.mockReturnValue(100000)
    getDescription.mockReturnValue('Description')

    const result = getPaymentRequests(csv)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      schemeId: 1,
      frn: '1234567890',
      marketingYear: '2021',
      contractNumber: 'CN123',
      dueDate: '2021-01-01',
      schedule: 'Q4',
      ledger: 'AP',
      debtType: 'adm',
      recoveryDate: undefined,
      originalInvoiceNumber: undefined,
      originalSettlementDate: undefined,
      pillar: undefined,
      invoiceLines: [
        {
          schemeCode: 'SCH123',
          description: 'Description',
          value: '1000',
          accountCode: 'ACC1',
          fundCode: undefined,
          deliveryBody: undefined,
          agreementNumber: undefined
        }
      ],
      value: 100000
    })
  })
})
