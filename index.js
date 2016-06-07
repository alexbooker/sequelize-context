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
    modelsGlob = path.join(__dirname, modelsGlob)
    this.connection = new Sequelize(...sequelizeArgs)
    return readdir(modelsGlob).then(modelNames => {
      if (modelNames.length < 1) {
        throw new Error(`Could not find any models in ${modelsGlob}.`)
      }
      this.models = modelNames.reduce((models, modelName) => {
        const modelPath = path.join(modelsGlob, modelName)
        const createModel = require(modelPath)
        if (typeof createModel !== 'function') {
          throw new Error(`Found a model named ${modelPath} but it does not export a function.`)
        }
        const model = createModel(this)
        if (!model) {
          throw new Error(`Found a model named ${modelPath}. It exports a function but that function doesn't return anything.`)
        }
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
