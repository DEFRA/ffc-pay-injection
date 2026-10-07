const {
  isValidSchemeId,
  getSchemeIdFromPillar
} = require('ffc-pay-schemes')

jest.mock('ffc-pay-schemes', () => ({
  isValidSchemeId: jest.fn(),
  getSchemeIdFromPillar: jest.fn()
}))

const { getSchemeId } = require('../../../app/processing/get-scheme-id')

describe('getSchemeId', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test.each([null, undefined])('throws when scheme is %p', (scheme) => {
    expect(() => getSchemeId(scheme))
      .toThrow(`Scheme ${scheme} is not recognised`)
  })

  test('returns the scheme when it is a valid scheme ID', () => {
    isValidSchemeId.mockReturnValue(true)

    expect(getSchemeId(1)).toBe(1)
    expect(isValidSchemeId).toHaveBeenCalledWith(1)
    expect(getSchemeIdFromPillar).not.toHaveBeenCalled()
  })

  test('returns the scheme ID for a recognised pillar', () => {
    isValidSchemeId.mockReturnValue(false)
    getSchemeIdFromPillar.mockReturnValue(1)

    expect(getSchemeId('SFI')).toBe(1)
    expect(getSchemeIdFromPillar)
      .toHaveBeenCalledWith('SFI')
  })

  test('throws when the scheme is not recognised', () => {
    isValidSchemeId.mockReturnValue(false)
    getSchemeIdFromPillar.mockReturnValue(undefined)

    expect(() => getSchemeId('unknown'))
      .toThrow('Scheme unknown is not recognised')
  })
})
