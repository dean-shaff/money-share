"use strict"

const path = require("path")

const Boom = require('@hapi/boom')
const { Op } = require('sequelize')

const user = require("./controllers/user.js")
const { User } = require("./models")


const publicDir = path.join(__dirname, "../client/")

const getHome = function (request, h) {
  return h.file(path.join(publicDir, "index.html"))
}

const verifyUser = async (request, h) => {
  const user = await User.findOne({
    where: {
      [Op.or]: [
        {email: request.payload.email},
        {username: request.payload.username},
      ]
    }
  })
  if (user) {
    if (user.username === request.payload.username) {
      throw Boom.badRequest('Username already taken!')
    } else if (user.email === request.payload.email) {
      throw Boom.badRequest('Email already taken!')
    }
  }
  return h.response(request.payload)
}


const loginHandler = async (request, h) => {
  console.log('loginHandler')
  const { username, password } = request.payload;
  const user = await models.User.findOne({
    where: {
      'username': username
    }
  })
  if (! user) {
    // return h.redirect('/login')
    return h.response("User doesn't exist").code(400)
  }
  if (! await user.validPassword(password)) {
    // return h.redirect('/login')
    return h.response("Invalid Password").code(400)
  }
  const token = createToken(user)
  return h.response({'id_token': token}).code(201);
}

const registerHandler = async (request, h) => {
  const user = await user.create(request, h)
  const token = createToken(user)
  return h.response({'id_token': token}).code(201)
}



module.exports = [
  {
    method: "POST",
    path: "/api/user",
    handler: user.create,
    options: {
      description: "Adds a new user",
      payload: {
        multipart: true,
      },
      auth: false,
      pre: [
        { method: verifyUser }
      ]
    }
  },
  {
    method: "GET",
    path: "/api/users",
    handler: user.list,
    config: {
      description: "List all users"
    }
  },
  {
    method: "GET",
    path: "/api/user/{id}",
    handler: user.get,
    config: {
      description: "Get a user by id"
    }
  },
  {
    method: "PUT",
    path: "/api/user/{id}",
    handler: user.update,
    config: {
      description: "Updates the selected user",
      payload: {
        multipart: true,
      }
    }
  },
  {
    method: "DELETE",
    path: "/api/user/{id}",
    handler: user.delete,
    config: {
      description: "Deletes the selected user"
    }
  },
  {
    method: "GET",
    path: "/",
    handler: getHome,
    config: {
      description: "Return index.html",
      auth: false
    }
  },
  {
    method: "GET",
    path: "/login",
    handler: getHome,
    options: {
      description: "Return index.html",
      auth: false
    }
  },
  {
    method: "POST",
    path: "/login",
    handler: loginHandler,
    options: {
      description: "Get JWT token for user",
      auth: false
    }
  },
  {
    method: "GET",
    path: "/register",
    handler: getHome,
    config: {
      description: "Return index.html",
      auth: false
    }
  },
  {
    method: "POST",
    path: "/register",
    handler: registerHandler,
    config: {
      description: "Register new user",
      auth: false
    }
  },
  {
    method: "GET",
    path: "/dashboard",
    handler: getHome,
    config: {
      description: "Return index.html",
      auth: false
    }
  },
  {
    method: "GET",
    path: "/{param*}",
    handler: {
      directory: {
        path: publicDir
      }
    },
    config: {
      description: "Provides static resources",
      auth: false
    }
  }
]
