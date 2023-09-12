module.exports = (sequelize, DataTypes) => {
  return sequelize.define('invoiceNumber', {
    invoiceId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    schemeId: DataTypes.INTEGER,
    frn: DataTypes.BIGINT,
    agreementNumber: DataTypes.STRING,
    hash: DataTypes.STRING,
    created: DataTypes.DATE
  },
  {
    tableName: 'invoiceNumbers',
    freezeTableName: true,
    timestamps: false
  })
}
