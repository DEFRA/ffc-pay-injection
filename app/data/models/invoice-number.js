module.exports = (sequelize, DataTypes) => {
  return sequelize.define('invoiceNumber', {
    invoiceId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: false },
  },
  {
    tableName: 'invoiceNumbers',
    freezeTableName: true,
    timestamps: false
  })
}
