module.exports = (sequelize, DataTypes) => {
  return sequelize.define('lock', {
    lockId: { type: DataTypes.INTEGER, primaryKey: true }
  },
  {
    tableName: 'lock',
    freezeTableName: true,
    timestamps: false
  })
}
