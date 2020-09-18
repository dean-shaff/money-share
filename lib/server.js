"use strict"

const path = require("path")

const Hapi = require("@hapi/hapi")
const qs = require('qs');

const settings = require("./../settings.js")
const routes = require("./routes.js")
const models = require("./models");

const { createToken } = require('./services/token.js')


const validate = async (decoded, request, h) => {
  console.log(`validate`)
  const user = await models.User.findOne({
    where: {
      'id': decoded.id
    }
  })
  if (!user) {
    return { isValid: false };
  }
  const isValid = user.validPassword(password)
  // const credentials = { id: user.id, name: user.name };
  return { isValid };
};

exports.init = async () => {
  const server = new Hapi.Server({
    port: settings.port,
    query: {
       parser: (query) => qs.parse(query)
    }
  })
  await server.register([require("@hapi/inert"), require('hapi-auth-jwt2')])
  server.auth.strategy('jwt', 'jwt', {
     'key': 'hello',
     'validate':  validate,
     'verifyOptions': { algorithms: [ 'HS256' ] }
   });
  // server.auth.default("jwt")
  server.route(routes)
  await models.sequelize.sync()
  await server.initialize()
  return server
}

exports.start = async (server) => {
  await server.start()
  console.log(`Server running at: ${server.info.uri}`)
  return server
}

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});
