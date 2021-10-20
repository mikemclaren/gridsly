const withTM = require('next-transpile-modules')([
  'konva',
  'colorette',
  'nanoid'
])

module.exports = withTM()
