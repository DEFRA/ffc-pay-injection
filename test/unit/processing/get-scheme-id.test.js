const {
  SFI, SFIP, LumpSums, VetVisits, CS, BPS, MANUAL, ES, FC, IMPS,
  SFI23, DELINKED, SFI_EXPANDED, COHT_REVENUE, COHT_CAPITAL, FPTT
} = require('../../../app/constants/schemes')

const {
  SFI: SFI_NAME, SFIP: SFIP_NAME, LumpSums: LSES_NAME, VetVisits: AHWR_NAME,
  CS: CS_NAME, BPS: BPS_NAME, MANUAL: MANUAL_NAME,
  ES: ES_NAME, FC: FC_NAME, IMPS: IMPS_NAME, SFI23: SFI23_NAME,
  DELINKED: DELINKED_NAME, SFI_EXPANDED: SFI_EXPANDED_NAME,
  COHT_REVENUE: COHT_REVENUE_NAME, COHT_CAPITAL: COHT_CAPITAL_NAME, FPTT: FPTT_NAME
} = require('../../../app/constants/schemes-names')

const { getSchemeId } = require('../../../app/processing/get-scheme-id')

describe('getSchemeId', () => {
  const cases = [
    [SFI, SFI_NAME, SFI],
    [SFIP, SFIP_NAME, SFIP],
    [LumpSums, LSES_NAME, LumpSums],
    [VetVisits, AHWR_NAME, VetVisits],
    [CS, CS_NAME, CS],
    [BPS, BPS_NAME, BPS],
    [MANUAL, MANUAL_NAME, MANUAL],
    [ES, ES_NAME, ES],
    [FC, FC_NAME, FC],
    [IMPS, IMPS_NAME, IMPS],
    [SFI23, SFI23_NAME, SFI23],
    [DELINKED, DELINKED_NAME, DELINKED],
    [SFI_EXPANDED, SFI_EXPANDED_NAME, SFI_EXPANDED],
    [COHT_REVENUE, COHT_REVENUE_NAME, COHT_REVENUE],
    [COHT_CAPITAL, COHT_CAPITAL_NAME, COHT_CAPITAL],
    [FPTT, FPTT_NAME, FPTT]
  ]

  test.each(cases)(
    'returns correct scheme for id %p and name %p',
    (schemeId, schemeName, expected) => {
      expect(getSchemeId(schemeId)).toBe(expected)
      expect(getSchemeId(schemeName)).toBe(expected)
    }
  )

  test('throws error if scheme not recognised', () => {
    expect(() => getSchemeId('unknown')).toThrow()
  })
})
