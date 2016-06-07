const Sequelize = require('sequelize')
const pify = require('pify')
const glob = pify(require('glob'))

const associateModels = (models) => {
  Object.keys(models).forEach(model => {
    if (models[model].associate) {
      models[model].associate(models)
    }
  })
}

const reduceModels = (modelPaths) => {
  return modelPaths.reduce((models, modelPath) => {
    const createModel = require(modelPath)
    if (typeof createModel !== 'function') {
      throw new Error(`Found a model named ${modelPath} but it does not export a function.`)
    }
    const model = createModel(context)
    if (!model) {
      throw new Error(`Found a model named ${modelPath}.
It exports a function but that function doesn't return anything.`)
    }
    return Object.assign(models, {
      [model.name]: model
    })
  }, { })
}

const context = {
  Sequelize,
  connect (modelsGlob, ...sequelizeArgs) {
    this.connection = new Sequelize(...sequelizeArgs)
    return glob(modelsGlob).then(modelPaths => {
      if (modelPaths.length < 1) {
        throw new Error(`Could not find any models in ${modelsGlob}.`)
      }
      this.models = reduceModels(modelPaths)
    }).then(() => {
      associateModels(this.models)
      return this.connection.sync()
    })
  }
}

module.exports = context
