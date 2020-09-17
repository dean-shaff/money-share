"use strict"

const path = require("path")

const Boom = require('@hapi/boom')
const { Op } = require('sequelize')

const controllers = require("./controllers")
const { User } = require("./models")
const { createToken } = require('./services/token.js')

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
  const user = await controllers.user.create(request, h)
  const token = createToken(user)
  return h.response({'id_token': token}).code(201)
}

const reactRouterRoutes = [
  '/', '/login', '/register', '/dashboard', '/configuration', '/members', '/queue', '/createRotation'
]

let routes = [
  {
    method: "POST",
    path: "/api/users",
    handler: controllers.user.list,
    config: {
      description: "List specified users",
      payload: {
        multipart: true,
      },
      auth: false
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
      description: "Get a user by id",
      auth: false
    }
  },
  {
    method: "GET",
    path: "/api/user/{userId}/rotations",
    handler: controllers.rotation.getUserRotations,
    config: {
      description: "Get rotations managed by a given user",
      auth: false
    }
  },
  {
    method: "GET",
    path: "/api/user/{userId}/cycleNotes",
    handler: controllers.cycleNote.getUserCycleNotes,
    config: {
      description: "Get a user's cycle notes",
      auth: false
    }
  },
  {
    method: "GET",
    path: "/api/user/{userId}/cycleNote/{id}",
    handler: controllers.cycleNote.get,
    config: {
      description: "Get a particular cycle note",
      auth: false
    }
  },
  {
    method: "POST",
    path: "/api/user/{userId}/cycleNote",
    handler: controllers.cycleNote.create,
    config: {
      description: "Create a cycle note",
      auth: false,
      payload: {
        multipart: true,
      }
    }
  },
  {
    method: "PUT",
    path: "/api/user/{userId}/cycleNote/{id}",
    handler: controllers.cycleNote.update,
    config: {
      description: "Update a cycle note",
      auth: false,
      payload: {
        multipart: true,
      }
    }
  },
  {
    method: "DELETE",
    path: "/api/user/{userId}/cycleNote/{id}",
    handler: controllers.cycleNote.delete,
    config: {
      description: "Delete a cycle note",
      auth: false
    }
  },
  {
    method: "PUT",
    path: "/api/user/{id}",
    handler: controllers.user.update,
    config: {
      description: "Updates the selected user",
      auth: false,
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
    method: "POST",
    path: "/api/rotations",
    handler: controllers.rotation.list,
    config: {
      description: "List specified rotations",
      auth: false,
      payload: {
        multipart: true,
      },
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
      auth: false,
      description: "Get a rotation by id"
    }
  },
  {
    method: "PUT",
    path: "/api/rotation/{id}",
    handler: controllers.rotation.update,
    config: {
      description: "Updates the selected rotation",
      auth: false,
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
      description: "Deletes the selected rotation",
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
    method: "POST",
    path: "/register",
    handler: registerHandler,
    config: {
      description: "Register new user",
      auth: false,
      payload: {
        multipart: true,
      }
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

reactRouterRoutes.forEach(routeName => {
  routes.push(
    {
      method: "GET",
      path: routeName,
      handler: getHome,
      config: {
        description: "Return index.html",
        auth: false
      }
    })
})



module.exports = routes
