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
  switch (scheme.toString().toLowerCase()) {
    case SFI.toString():
    case SFI_NAME.toLowerCase():
      return SFI
    case SFIP.toString():
    case SFIP_NAME.toLowerCase():
      return SFIP
    case LumpSums.toString():
    case LSES_NAME.toLowerCase():
      return LumpSums
    case VetVisits.toString():
    case AHWR_NAME.toLowerCase():
      return VetVisits
    case CS.toString():
    case CS_NAME.toLowerCase():
      return CS
    case BPS.toString():
    case BPS_NAME.toLowerCase():
      return BPS
    case FDMR.toString():
    case FDMR_NAME.toLowerCase():
      return FDMR
    case MANUAL.toString():
    case MANUAL_NAME.toLowerCase():
      return MANUAL
    case ES.toString():
    case ES_NAME.toLowerCase():
      return ES
    case FC.toString():
    case FC_NAME.toLowerCase():
      return FC
    case IMPS.toString():
    case IMPS_NAME.toLowerCase():
      return IMPS
    case SFI23.toString():
    case SFI23_NAME.toLowerCase():
      return SFI23
    default:
      throw new Error(`Scheme ${scheme} is not recognised`)
  }
}

module.exports = {
  getSchemeId
}
