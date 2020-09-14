"use strict"

const path = require("path")

const Boom = require('@hapi/boom')
const { Op } = require('sequelize')

const controllers = require("./controllers")
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
    console.log(`verifyUser: user.username=${user.username}, request.payload.username=${request.payload.username}`)
    console.log(`verifyUser: user.email=${user.email}, request.payload.email=${request.payload.email}`)
    if (user.username === request.payload.username) {
      throw Boom.badRequest('Username already taken!')
    } else if (user.email === request.payload.email) {
      throw Boom.badRequest('Email already taken!')
    }
  }
  return h.response(request.payload)
}

/**
 * Ensure that a rotation with a given name is not already associated with the manager
 * @param  {[type]}  request [description]
 * @param  {[type]}  h       [description]
 * @return {Promise}         [description]
 */
const verifyRotation = async (request, h) => {
  return h.response(request.payload)
}


const loginHandler = async (request, h) => {
  console.log('loginHandler')
  const { username, password } = request.payload;
  const user = await User.findOne({
    where: {
      'username': username
    }
  })
  if (! user) {
    let msg = "User doesn't exist"
    console.log(`loginHandler: ${msg}`)
    throw Boom.badRequest(msg)
  }
  if (! await user.validPassword(password)) {
    let msg = "Invalid Password"
    console.log(`loginHandler: ${msg}`)
    throw Boom.badRequest(msg)
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
    method: "GET",
    path: "/api/users",
    handler: controllers.user.list,
    config: {
      description: "List specified users"
    }
  },
  {
    method: "POST",
    path: "/api/user",
    handler: controllers.user.create,
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
    path: "/api/user/{id}",
    handler: controllers.user.get,
    config: {
      description: "Get a user by id"
    }
  },
  {
    method: "PUT",
    path: "/api/user/{id}",
    handler: controllers.user.update,
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
    handler: controllers.user.delete,
    config: {
      description: "Deletes the selected user"
    }
  },
  {
    method: "GET",
    path: "/api/users",
    handler: controllers.user.list,
    config: {
      description: "List all users"
    }
  },
  {
    method: "POST",
    path: "/api/rotation",
    handler: controllers.rotation.create,
    options: {
      description: "Adds a new rotation",
      payload: {
        multipart: true,
      },
      auth: false,
      pre: [
        { method: verifyRotation }
      ]
    }
  },
  {
    method: "GET",
    path: "/api/rotation/{id}",
    handler: controllers.rotation.get,
    config: {
      description: "Get a rotation by id"
    }
  },
  {
    method: "PUT",
    path: "/api/rotation/{id}",
    handler: controllers.rotation.update,
    config: {
      description: "Updates the selected rotation",
      payload: {
        multipart: true,
      }
    }
  },
  {
    method: "DELETE",
    path: "/api/rotation/{id}",
    handler: controllers.rotation.delete,
    config: {
      description: "Deletes the selected rotation"
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
      payload: {
        multipart: true,
      },
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
