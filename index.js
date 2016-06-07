const Sequelize = require('sequelize')
const pify = require('pify')
const glob = pify(require('glob'))

const context = {
  Sequelize,

  connect (modelsGlob, ...sequelizeArgs) {
    this.connection = new Sequelize(...sequelizeArgs)
    return glob(modelsGlob).then(modelPaths => {
      if (modelPaths.length < 1) {
        throw new Error(`Could not find any models in ${modelsGlob}.`)
      }
      this.models = modelPaths.reduce((models, modelPath) => {
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
