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
  SFI23
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
  SFI23: SFI23_NAME
} = require('../constants/schemes-names')

const getSchemeId = (scheme) => {
  switch (scheme) {
    case SFI:
    case SFI_NAME:
      return SFI
    case SFIP:
    case SFIP_NAME:
      return SFIP
    case LumpSums:
    case LSES_NAME:
      return LumpSums
    case VetVisits:
    case AHWR_NAME:
      return VetVisits
    case CS:
    case CS_NAME:
      return CS
    case BPS:
    case BPS_NAME:
      return BPS
    case FDMR:
    case FDMR_NAME:
      return FDMR
    case MANUAL:
    case MANUAL_NAME:
      return MANUAL
    case ES:
    case ES_NAME:
      return ES
    case FC:
    case FC_NAME:
      return FC
    case IMPS:
    case IMPS_NAME:
      return IMPS
    case SFI23:
    case SFI23_NAME:
      return SFI23
    default:
      throw new Error(`Scheme ${scheme} is not recognised`)
  }
}

module.exports = {
  getSchemeId
}
