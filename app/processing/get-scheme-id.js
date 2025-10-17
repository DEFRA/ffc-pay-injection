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
} = require('../constants/schemes')

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
} = require('../constants/schemes-names')

const mapSchemeNames = {
  [SFI_NAME.toLowerCase()]: SFI,
  [SFIP_NAME.toLowerCase()]: SFIP,
  [LSES_NAME.toLowerCase()]: LumpSums,
  [AHWR_NAME.toLowerCase()]: VetVisits,
  [CS_NAME.toLowerCase()]: CS,
  [BPS_NAME.toLowerCase()]: BPS,
  [FDMR_NAME.toLowerCase()]: FDMR,
  [MANUAL_NAME.toLowerCase()]: MANUAL,
  [ES_NAME.toLowerCase()]: ES,
  [FC_NAME.toLowerCase()]: FC,
  [IMPS_NAME.toLowerCase()]: IMPS,
  [SFI23_NAME.toLowerCase()]: SFI23,
  [DELINKED_NAME.toLowerCase()]: DELINKED,
  [SFI_EXPANDED_NAME.toLowerCase()]: SFI_EXPANDED,
  [COHT_REVENUE_NAME.toLowerCase()]: COHT_REVENUE,
  [COHT_CAPITAL_NAME.toLowerCase()]: COHT_CAPITAL
}

const idMap = Object.fromEntries(
  Object.values({
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
  })
    .filter(val => val != null)
    .map(val => [val.toString(), val])
)

const getSchemeId = (scheme) => {
  if (scheme == null) {
    throw new Error(`Scheme ${scheme} is not recognised`)
  }

  const raw = scheme.toString().trim()

  if (idMap?.[raw]) {
    return idMap[raw]
  }

  const lower = raw.toLowerCase()

  if (mapSchemeNames?.[lower]) {
    return mapSchemeNames[lower]
  }

  throw new Error(`Scheme ${scheme} is not recognised`)
}

module.exports = {
  getSchemeId
}
