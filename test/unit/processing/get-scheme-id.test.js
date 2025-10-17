const {
  SFI,
  SFIP,
  LumpSums,
  VetVisits,
  CS,
  BPS,
  FDMR,
  MANUAL,
  ES,
  FC,
  IMPS,
  SFI23,
  DELINKED,
  SFI_EXPANDED,
  COHT_REVENUE,
  COHT_CAPITAL
} = require('../../../app/constants/schemes')

const {
  SFI: SFI_NAME,
  SFIP: SFIP_NAME,
  LumpSums: LSES_NAME,
  VetVisits: AHWR_NAME,
  CS: CS_NAME,
  BPS: BPS_NAME,
  FDMR: FDMR_NAME,
  MANUAL: MANUAL_NAME,
  ES: ES_NAME,
  FC: FC_NAME,
  IMPS: IMPS_NAME,
  SFI23: SFI23_NAME,
  DELINKED: DELINKED_NAME,
  SFI_EXPANDED: SFI_EXPANDED_NAME,
  COHT_REVENUE: COHT_REVENUE_NAME,
  COHT_CAPITAL: COHT_CAPITAL_NAME
} = require('../../../app/constants/schemes-names')

const { getSchemeId } = require('../../../app/processing/get-scheme-id')

describe('get scheme id', () => {
  test('should return SFI if SFI scheme Id', () => {
    const result = getSchemeId(SFI)
    expect(result).toBe(SFI)
  })

  test('should return SFI if SFI scheme name', () => {
    const result = getSchemeId(SFI_NAME)
    expect(result).toBe(SFI)
  })

  test('should return SFI Pilot if SFI Pilot scheme Id', () => {
    const result = getSchemeId(SFIP)
    expect(result).toBe(SFIP)
  })

  test('should return SFI Pilot if SFI Pilot scheme name', () => {
    const result = getSchemeId(SFIP_NAME)
    expect(result).toBe(SFIP)
  })

  test('should return Lump Sums if Lump Sums scheme Id', () => {
    const result = getSchemeId(LumpSums)
    expect(result).toBe(LumpSums)
  })

  test('should return Lump Sums if Lump Sums scheme name', () => {
    const result = getSchemeId(LSES_NAME)
    expect(result).toBe(LumpSums)
  })

  test('should return AHWR if AHWR scheme Id', () => {
    const result = getSchemeId(VetVisits)
    expect(result).toBe(VetVisits)
  })

  test('should return AHWR if AHWR scheme name', () => {
    const result = getSchemeId(AHWR_NAME)
    expect(result).toBe(VetVisits)
  })

  test('should return CS if CS scheme Id', () => {
    const result = getSchemeId(CS)
    expect(result).toBe(CS)
  })

  test('should return CS if CS scheme name', () => {
    const result = getSchemeId(CS_NAME)
    expect(result).toBe(CS)
  })

  test('should return BPS if BPS scheme Id', () => {
    const result = getSchemeId(BPS)
    expect(result).toBe(BPS)
  })

  test('should return BPS if BPS scheme name', () => {
    const result = getSchemeId(BPS_NAME)
    expect(result).toBe(BPS)
  })

  test('should return FDMR if FDMR scheme Id', () => {
    const result = getSchemeId(FDMR)
    expect(result).toBe(FDMR)
  })

  test('should return FDMR if FDMR scheme name', () => {
    const result = getSchemeId(FDMR_NAME)
    expect(result).toBe(FDMR)
  })

  test('should return MANUAL if MANUAL scheme Id', () => {
    const result = getSchemeId(MANUAL)
    expect(result).toBe(MANUAL)
  })

  test('should return MANUAL if MANUAL scheme name', () => {
    const result = getSchemeId(MANUAL_NAME)
    expect(result).toBe(MANUAL)
  })

  test('should return ES if ES scheme Id', () => {
    const result = getSchemeId(ES)
    expect(result).toBe(ES)
  })

  test('should return ES if ES scheme name', () => {
    const result = getSchemeId(ES_NAME)
    expect(result).toBe(ES)
  })

  test('should return FC if FC scheme Id', () => {
    const result = getSchemeId(FC)
    expect(result).toBe(FC)
  })

  test('should return FC if FC scheme name', () => {
    const result = getSchemeId(FC_NAME)
    expect(result).toBe(FC)
  })

  test('should return IMPS if IMPS scheme Id', () => {
    const result = getSchemeId(IMPS)
    expect(result).toBe(IMPS)
  })

  test('should return IMPS if IMPS scheme name', () => {
    const result = getSchemeId(IMPS_NAME)
    expect(result).toBe(IMPS)
  })

  test('should return SFI23 if SFI23 scheme Id', () => {
    const result = getSchemeId(SFI23)
    expect(result).toBe(SFI23)
  })

  test('should return SFI23 if SFI23 scheme name', () => {
    const result = getSchemeId(SFI23_NAME)
    expect(result).toBe(SFI23)
  })

  test('should return DELINKED if DELINKED scheme Id', () => {
    const result = getSchemeId(DELINKED)
    expect(result).toBe(DELINKED)
  })

  test('should return DELINKED if DELINKED scheme name', () => {
    const result = getSchemeId(DELINKED_NAME)
    expect(result).toBe(DELINKED)
  })

  test('should return SFI Expanded if SFI Expanded scheme Id', () => {
    const result = getSchemeId(SFI_EXPANDED)
    expect(result).toBe(SFI_EXPANDED)
  })

  test('should return SFI Expanded if SFI Expanded scheme name', () => {
    const result = getSchemeId(SFI_EXPANDED_NAME)
    expect(result).toBe(SFI_EXPANDED)
  })

  test('should return COHT_REVENUE if COHT_REVENUE scheme Id', () => {
    const result = getSchemeId(COHT_REVENUE)
    expect(result).toBe(COHT_REVENUE)
  })

  test('should return COHT_REVENUE if COHT_REVENUE scheme name', () => {
    const result = getSchemeId(COHT_REVENUE_NAME)
    expect(result).toBe(COHT_REVENUE)
  })

  test('should return COHT_CAPITAL if COHT_CAPITAL scheme Id', () => {
    const result = getSchemeId(COHT_CAPITAL)
    expect(result).toBe(COHT_CAPITAL)
  })

  test('should return COHT_CAPITAL if COHT_CAPITAL scheme name', () => {
    const result = getSchemeId(COHT_CAPITAL_NAME)
    expect(result).toBe(COHT_CAPITAL)
  })

  test('should throw error if scheme Id not recognised', () => {
    expect(() => getSchemeId('unknown')).toThrow()
  })
})
