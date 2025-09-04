module.exports = (sequelize, DataTypes) => {
  return sequelize.define('manualUpload', {
    uploadId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    filename: DataTypes.STRING,
    uploader: DataTypes.STRING,
    timeStamp: DataTypes.DATE,
    checksum: DataTypes.STRING
  },
  {
    tableName: 'manualUploads',
    freezeTableName: true,
    timestamps: false
  })
}
