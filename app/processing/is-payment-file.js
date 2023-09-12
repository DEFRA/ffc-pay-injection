const isPaymentFile = (filename) => {
  return /^FFC_Manual_Batch_.*csv$/.test(filename)
}

module.exports = {
  isPaymentFile
}
