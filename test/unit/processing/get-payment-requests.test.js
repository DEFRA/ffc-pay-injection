const fs = require('fs')
const path = require('path')
const { getPaymentRequests } = require('../../../app/processing/get-payment-requests')
const { SFI } = require('../../../app/constants/schemes-names')
const { SFI: SFI_ID, MANUAL, SFI23 } = require('../../../app/constants/schemes')
const { AP, AR } = require('../../../app/constants/ledgers')
const { G00, P24 } = require('../../../app/constants/descriptions')

const readCSVFile = (filePath) => {
  const csvContent = fs.readFileSync(path.resolve(__dirname, filePath), 'utf8')
  return csvContent.trim().split('\n')
}

describe('get payment requests from csv contents', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should return an empty array when input CSV is empty', () => {
    const csv = []
    const result = getPaymentRequests(csv)
    expect(result).toEqual([])
  })

  test('should correctly group and transform CSV data into payment requests for a manual ledger recovery requests', () => {
    const csv = readCSVFile('../../files/manual-ledger-recovery.csv')

    const result = getPaymentRequests(csv)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      schemeId: MANUAL,
      frn: '1000000001',
      marketingYear: '2023',
      agreementNumber: 'Z00000001',
      dueDate: '2023-10-01',
      schedule: 'Q4',
      ledger: AR,
      debtType: 'ADM',
      recoveryDate: '2023-10-01',
      originalInvoiceNumber: 'S123456789C123456V001',
      originalSettlementDate: '2023-10-01',
      documentType: undefined,
      pillar: SFI,
      invoiceLines: [
        {
          schemeCode: '80201',
          description: `G00 - ${G00}`,
          value: '250.00',
          accountCode: 'SOS270'
        }
      ],
      value: 25000
    })
  })

  test('should correctly group and transform CSV data into payment requests for manual ledger requests', () => {
    const csv = readCSVFile('../../files/manual-ledger.csv')

    const result = getPaymentRequests(csv)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      schemeId: MANUAL,
      frn: '1000000001',
      marketingYear: '2023',
      agreementNumber: 'Z00000001',
      dueDate: '2023-10-01',
      schedule: 'Q4',
      ledger: AR,
      debtType: undefined,
      recoveryDate: undefined,
      originalInvoiceNumber: undefined,
      originalSettlementDate: undefined,
      documentType: undefined,
      pillar: SFI,
      invoiceLines: [
        {
          schemeCode: '80201',
          description: `G00 - ${G00}`,
          value: '250.00',
          accountCode: 'SOS270'
        }
      ],
      value: 25000
    })
  })

  test('should correctly group and transform CSV data into payment requests for standard manual request', () => {
    const csv = readCSVFile('../../files/manual.csv')

    const result = getPaymentRequests(csv)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      schemeId: MANUAL,
      frn: '1000000001',
      marketingYear: '2023',
      agreementNumber: 'Z00000001',
      dueDate: '2023-10-01',
      schedule: 'Q4',
      ledger: AP,
      debtType: undefined,
      recoveryDate: undefined,
      originalInvoiceNumber: undefined,
      originalSettlementDate: undefined,
      documentType: undefined,
      pillar: SFI,
      invoiceLines: [
        {
          schemeCode: '80201',
          description: `G00 - ${G00}`,
          value: '250.00',
          accountCode: 'SOS270'
        }
      ],
      value: 25000
    })
  })

  test('should correctly group and transform CSV data into payment requests for minimal input', () => {
    const csv = readCSVFile('../../files/minimal.csv')

    const result = getPaymentRequests(csv)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      schemeId: SFI_ID,
      frn: '1000000001',
      marketingYear: '2023',
      agreementNumber: 'Z00000001',
      dueDate: '2023-10-01',
      schedule: undefined,
      ledger: AP,
      debtType: undefined,
      recoveryDate: undefined,
      originalInvoiceNumber: undefined,
      originalSettlementDate: undefined,
      documentType: undefined,
      pillar: undefined,
      invoiceLines: [
        {
          schemeCode: '80201',
          description: `G00 - ${G00}`,
          value: '250.00',
          accountCode: undefined
        }
      ],
      value: 25000
    })
  })

  test('should correctly group and transform CSV data into payment requests for multiline payments', () => {
    const csv = readCSVFile('../../files/multi-line.csv')

    const result = getPaymentRequests(csv)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      schemeId: SFI_ID,
      frn: '1000000001',
      marketingYear: '2023',
      agreementNumber: 'Z00000001',
      dueDate: '2023-10-01',
      schedule: undefined,
      ledger: AP,
      debtType: undefined,
      recoveryDate: undefined,
      originalInvoiceNumber: undefined,
      originalSettlementDate: undefined,
      documentType: undefined,
      pillar: undefined,
      invoiceLines: [
        {
          schemeCode: '80201',
          description: `G00 - ${G00}`,
          value: '250.00',
          accountCode: undefined
        },
        {
          schemeCode: '80202',
          description: `G00 - ${G00}`,
          value: '250.00',
          accountCode: undefined
        },
        {
          schemeCode: '80202',
          description: `P24 - ${P24}`,
          value: '-125.00',
          accountCode: undefined
        }
      ],
      value: 37500
    })
  })

  test('should correctly group and transform CSV data into payment requests for multiple payments in one file', () => {
    const csv = readCSVFile('../../files/multi-payment.csv')

    const result = getPaymentRequests(csv)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      schemeId: SFI_ID,
      frn: '1000000001',
      marketingYear: '2023',
      agreementNumber: 'Z00000001',
      dueDate: '2023-10-01',
      schedule: undefined,
      ledger: AP,
      debtType: undefined,
      recoveryDate: undefined,
      originalInvoiceNumber: undefined,
      originalSettlementDate: undefined,
      documentType: undefined,
      pillar: undefined,
      invoiceLines: [
        {
          schemeCode: '80201',
          description: `G00 - ${G00}`,
          value: '250.00',
          accountCode: undefined
        },
        {
          schemeCode: '80202',
          description: `G00 - ${G00}`,
          value: '250.00',
          accountCode: undefined
        },
        {
          schemeCode: '80202',
          description: `P24 - ${P24}`,
          value: '-125.00',
          accountCode: undefined
        }
      ],
      value: 37500
    })
  })

  test('should correctly group and transform CSV data into payment requests when schedule provided', () => {
    const csv = readCSVFile('../../files/schedule.csv')

    const result = getPaymentRequests(csv)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      schemeId: SFI_ID,
      frn: '1000000001',
      marketingYear: '2023',
      agreementNumber: 'Z00000001',
      dueDate: '2023-10-01',
      schedule: 'Q4',
      ledger: AP,
      debtType: undefined,
      recoveryDate: undefined,
      originalInvoiceNumber: undefined,
      originalSettlementDate: undefined,
      documentType: undefined,
      pillar: undefined,
      invoiceLines: [
        {
          schemeCode: '80201',
          description: `G00 - ${G00}`,
          value: '250.00',
          accountCode: undefined
        }
      ],
      value: 25000
    })
  })

  test('should correctly group and transform CSV data into payment requests when document type included', () => {
    const csv = readCSVFile('../../files/sfi23-advance.csv')

    const result = getPaymentRequests(csv)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      schemeId: SFI23,
      frn: '1000000001',
      marketingYear: '2023',
      agreementNumber: 'Z00000001',
      dueDate: '2023-10-01',
      schedule: 'Q1',
      ledger: AP,
      debtType: undefined,
      recoveryDate: undefined,
      originalInvoiceNumber: undefined,
      originalSettlementDate: undefined,
      documentType: 'Advance',
      pillar: undefined,
      invoiceLines: [
        {
          schemeCode: '80201',
          description: `G00 - ${G00}`,
          value: '250.00',
          accountCode: 'SOS270'
        }
      ],
      value: 25000
    })
  })
})
