"use strict"

const path = require("path")

const Hapi = require("@hapi/hapi")

const settings = require("./../settings.js")
const routes = require("./routes.js")
const models = require("./models");


const validate = async (request, session) => {
  console.log(`validate: ${JSON.stringify(session)} `)
  const user = await models.User.findOne({
    where: {
      'username': username
    }
  })
  if (!user) {
    return { credentials: null, isValid: false };
  }
  const isValid = user.validPassword(password)
  const credentials = { id: user.id, name: user.name };
  return { isValid, credentials };
};


const loginHandler = async (request, h) => {
  console.log('loginHandler')
  const { username, password } = request.payload;
  const user = await models.User.findOne({
    where: {
      'username': username
    }
  })
  if (! user) {
    return h.redirect('/login')
  }
  if (! await user.validPassword(password)) {
    return h.redirect('/login')
  }
  request.cookieAuth.set({ id: user.id });
  return h.redirect('/');
}




exports.init = async () => {
  const server = new Hapi.Server({ port: settings.port })
  await server.register([require("@hapi/inert"), require('hapi-auth-jwt2')])
  // server.auth.strategy('simple', 'basic', { validate });
  // server.auth.default('simple')

  server.auth.strategy('session', 'cookie', {
    cookie: {
      name: 'money-share',
      password: '6`[9*Yr/+SdJK};;P.d6Ns{"7F{R"z}~o^g){H>/',
      isSecure: false
    },
    validateFunc: validate
  });
  // server.auth.default('session')
  routes.push({
    method: "POST",
    path: "/login",
    handler: loginHandler,
    options: {
      description: "Authenticate a user",
      payload: {
        output: 'stream',
        parse: true,
        multipart: true
      },
      auth: {
        mode: 'try',
        strategy: 'session'
      }
    }
  })
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
