const Sequelize = require('sequelize')
const fs = require('fs')
const pify = require('pify')
const path = require('path')

const readdir = pify(fs.readdir)

const context = {
  Sequelize,
  connection: undefined,
  models: undefined,

  connect (modelsGlob, ...sequelizeArgs) {
    this.connection = new Sequelize(...sequelizeArgs)
    return readdir(modelsGlob).then(modelNames => {
      this.models = modelNames.reduce((models, modelName) => {
        const modelPath = path.join(modelsGlob, modelName)
        const createModel = require(modelPath)
        const model = createModel(this.connection)
        return Object.assign(models, {
          [model.name]: model
        })
      }, { })
    }).then(() => {
      Object.keys(this.models).forEach(model => {
        if (this.models[model].associate) {
          this.models[model].associate(this.models)
        }
      })
      return this.connection.sync()
    })
  }
}

module.exports = context
