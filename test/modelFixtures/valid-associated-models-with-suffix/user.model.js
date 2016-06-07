module.exports = function (context) {
  const {connection} = context
  const user = connection.define('user', {
  }, {
    classMethods: {
      associate (models) {
        user.belongsTo(models.project)
      }
    }
  })
  return user
}
