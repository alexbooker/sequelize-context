module.exports = function (context) {
  const {connection} = context
  const project = connection.define('project', {
  }, {
    classMethods: {
      associate (models) {
        project.hasMany(models.user)
      }
    }
  })
  return project
}
