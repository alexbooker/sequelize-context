const {test} = require('mocha')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
const {expect} = chai

test('connect() throws when model doesn\'t exist', function () {
  const context = require('../')
  const actual = context.connect('./test/modelFixtures/empty-dir/*', 'testSchema', 'root', '', {
    dialect: 'sqlite',
    force: true
  })
  return expect(actual)
    .to
    .eventually
    .be
    .rejectedWith(/Could not find any models/)
})

test('connect() throws when model func doesn\'t return', function () {
  const context = require('../')
  const actual = context.connect('./test/modelFixtures/erroneous-model/*', 'testSchema', 'root', '', {
    dialect: 'sqlite',
    force: true
  })
  return expect(actual)
    .to
    .eventually
    .be
    .rejectedWith(/Found a model .* but that function doesn't return anything\./)
})

test('connect() throws when model doesn\'t export', function () {
  const context = require('../')
  const actual = context.connect('./test/modelFixtures/model-with-no-exports/*', 'test_schema', 'root', '', {
    dialect: 'sqlite',
    force: true
  })
  return expect(actual)
    .to
    .eventually
    .be
    .rejectedWith(/Found a model named .* but it does not export a function\./)
})

test('connect() creates associations', function () {
  const context = require('../')
  return context.connect('./test/modelFixtures/valid-associated-models/*', 'test_schema', 'root', '', {
    dialect: 'sqlite',
    force: true
  }).then(() => {
    expect(context.models.user.associations.project).to.exist
    expect(context.models.project.associations.users).to.exist
  })
})

test('connect() creates associations with models that match glob', function () {
  const context = require('../')
  return context.connect('./test/modelFixtures/valid-associated-models-with-suffix/**/*.model.js', 'test_schema', 'root', '', {
    dialect: 'sqlite',
    force: true
  }).then(() => {
    expect(context.models.user.associations.project).to.exist
    expect(context.models.project.associations.users).to.exist
  })
})
