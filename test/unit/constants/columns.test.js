const TABLES = require('../../../app/constants/tables')
const { PRIMARY_KEYS, COLUMNS, pickColumns } = require('../../../app/constants/columns')

describe('pickColumns', () => {
  test('keeps properties that are columns on the table', () => {
    const record = { schemeId: 1, frn: 'value' }

    expect(pickColumns(record, TABLES.invoiceNumbers)).toEqual(record)
  })

  test('drops properties that are not columns on the table', () => {
    const result = pickColumns({ schemeId: 1, notAColumn: 'value' }, TABLES.invoiceNumbers)

    expect(result).toEqual({ schemeId: 1 })
  })

  test('drops the primary key', () => {
    const result = pickColumns({ invoiceId: 1, schemeId: 1 }, TABLES.invoiceNumbers)

    expect(result).toEqual({ schemeId: 1 })
  })

  test('returns an empty object when given no properties', () => {
    expect(pickColumns({}, TABLES.invoiceNumbers)).toEqual({})
  })
})

describe('PRIMARY_KEYS', () => {
  test('each primary key is a column on its table', () => {
    for (const [table, primaryKey] of Object.entries(PRIMARY_KEYS)) {
      expect(COLUMNS[table]).toContain(primaryKey)
    }
  })
})
