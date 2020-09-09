"use strict"

const path = require("path")

const Hapi = require("@hapi/hapi")

const settings = require("./../settings.js")
const routes = require("./routes.js")
const models = require("./models");

exports.init = async () => {
  const server = new Hapi.Server({ port: settings.port })
  await server.register([require("@hapi/inert")])
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
