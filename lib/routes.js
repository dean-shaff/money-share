"use strict"

const crypto = require('crypto')
const path = require("path")

const { DateTime } = require('luxon')
const Boom = require('@hapi/boom')
const { Op } = require('sequelize')

const controllers = require("./controllers")
const { User, Rotation } = require("./models")
const { createJwtToken } = require('./services/token.js')
const { createHash } = require('./services/hash.js')
const ses = require('./services/ses.js')
const { setResetPasswordToken } = require('./services/resetPassword.js')

const settings = require('./../settings.js')

const publicDir = path.join(__dirname, "../client/dist")

const getHome = function (request, h) {
  return h.file(path.join(publicDir, "index.html"))
}


const forgotPasswordHandler = async (request, h) => {
  const email = request.payload.email
  console.log(`forgotPasswordHandler: ${email}`)
  let user = null
  try {
    user = await User.findOne({
      where: { email }
    })
  } catch (err) {
    console.log(err)
    const msg = "Couldn't complete database request"
    throw Boom.badRequest(msg)
  }


  if (user === null) {
    const msg = "A user with that email address doesn't exist"
    console.log(msg)
    throw Boom.badRequest(msg)
  }

  await setResetPasswordToken(user)
  console.log(`forgotPasswordHandler: setResetPasswordToken completed`)
  const token = user.resetPasswordToken

  const url = `${request.headers.origin}/reset/${token}`

  const subject = 'Password Reset'
  const body = `Hello!\n\nHere's your password reset link: ${url}`

  console.log(`forgotPasswordHandler: ${url}`)

  try {
    await ses.sendMail(
      settings.aws.fromAddress,
      user.email,
      subject,
      body
    )
    return h.response({success: true}).code(200)
  } catch (err) {
    console.log(err)
    return h.response({success: false}).code(200)
  }
}

const checkExpired = function (user) {
  const expires = DateTime.fromJSDate(user.resetPasswordExpires)
  const now = DateTime.local()
  console.log(`checkExpired: expires=${expires}`)
  console.log(`checkExpired: now=${now}`)
  if (now > expires) {
    return true
  }
  return false
}


const resetPasswordGetHandler = async (request, h) => {
  console.log('resetPasswordGetHandler')
  const token = request.params.token
  console.log(`resetPasswordGetHandler: token=${token}`)
  const user = await User.findOne({
    where: { resetPasswordToken: token }
  })
  if (! user) {
    const msg = "A user with this token doesn't exist"
    console.log(msg)
    throw Boom.badRequest(msg)
  }
  if (checkExpired(user)) {
    const msg = "This token has expired"
    console.log(msg)
    throw Boom.badRequest(msg)
  }
  return getHome(request, h)
}


const resetPasswordPostHandler = async (request, h) => {
  const { token, password } = request.payload
  const user = await User.findOne({
    where: { resetPasswordToken: token }
  })
  if (checkExpired(user)) {
    const msg = "This token has expired"
    console.log(msg)
    throw Boom.badRequest(msg)
  }
  user.password = await createHash(password)
  await Promise.all([user.save(), user.reload()])
  const jwtToken = createJwtToken(user)
  return h.response({'id_token': jwtToken}).code(201)
}



const changePasswordHandler = async (request, h) => {
  console.log('changePasswordHandler')
  console.log(request.payload)
  const { id, oldPassword, password } = request.payload
  console.log(`changePasswordHandler: id=${id}`)
  const user = await User.findByPk(id)
  if (! user) {
    let msg = 'No such user'
    console.log(`changePasswordHandler: ${msg}`)
    throw Boom.badRequest(msg)
  }
  if (! await user.validPassword(oldPassword)) {
    let msg = 'Old password incorrect'
    console.log(`changePasswordHandler: ${msg}`)
    throw Boom.badRequest(msg)
  }
  user.password = await createHash(password)
  await user.save()
  await user.reload()
  const token = createJwtToken(user)
  return h.response({'id_token': token}).code(201)
}


const verifyUser = async (request, h) => {

  console.log(`verifyUser: request.payload=${JSON.stringify(request.payload, null, 2)}`)
  let ops = []
  const fields = ['email', 'username']
  fields.forEach(name => {
    let val = request.payload[name]
    if (val !== undefined && val !== '') {
      ops.push({[name]: request.payload[name]})
    }
  })
  console.log(`verifyUser: ops=${JSON.stringify(ops, null, 2)}`)
  const user = await User.findOne({
    where: {
      [Op.or]: ops
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


const verifyRotation = async (request, h) => {
  console.log(`verifyRotation: request.payload=${JSON.stringify(request.payload, null, 2)}`)
  const { name, managerId } = request.payload
  const rotation = await Rotation.findOne({
    where: {
      [Op.and]: [
        { 'managerId': managerId },
        { 'name': name }
      ]
    }
  })
  if (rotation) {
    console.log(`verifyRotation: rotaion.managerId=${rotation.managerId}, request.payload.managerId=${request.payload.managerId}`)
    console.log(`verifyRotation: rotation.name=${rotation.name}, request.payload.name=${request.payload.name}`)
    throw Boom.badRequest('Rotation already exists')
  }

  return h.response(request.payload)
}


const loginHandler = async (request, h) => {
  console.log('loginHandler')
  const { username, password } = request.payload;
  console.log(`loginHandler: username=${username}, ${settings.jwt_key}`)
  const user = await User.findOne({
    where: {
      'username': username
    }
  })
  console.log(`loginHandler: user=${user}`)
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
  console.log(`loginHandler: creating token`)
  const token = createJwtToken(user)
  console.log(`loginHandler: token=${token}`)
  return h.response({'id_token': token}).code(201);
}

const registerHandler = async (request, h) => {
  console.log(`registerHandler: request.payload=${JSON.stringify(request.payload)}`)
  const capitalize = str => {
    let split = str.split(' ')
    return split.map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1)
    }).join(' ')
  }

  const simpleRegister = user => {
    const token = createJwtToken(user)
    return h.response({'id_token': token}).code(201)
  }
  // if (request.payload.id !== undefined) {
  //   console.log(`registerHandler: id=${request.payload.id}`)
  //   const existingUser = await User.findByPk(request.payload.id)
  //   console.log(`registerHandler: existingUser=${JSON.stringify(existingUser, null, 2)}`)
  //   if (! existingUser) {
  //     let msg = "User doesn't exist"
  //     console.log(`registerHandler: ${msg}`)
  //     throw Boom.badRequest(msg)
  //   }
  //
  //   if (! existingUser.autoCreated) {
  //     let msg = "Trying to update a non auto created user"
  //     console.log(`registerHandler: ${msg}`)
  //     throw Boom.badRequest(msg)
  //   }
  //   // this means we've already identified an autocreated user and we're updating it
  //   const {id, ...updates} = request.payload
  //   updates.autoCreated = false
  //   const user = await controllers.user.update({
  //     params: {'id': id},
  //     payload: updates
  //   }, null)
  //   return simpleRegister(user)
  // }
  const user = await User.findOne({
    where: {
      'username': request.payload.username
    }
  })

  if (user) {
    let msg = "A user exists with this username"
    console.log(`registerHandler: ${msg}`)
    throw Boom.badRequest(msg)
  }

  let query = {}
  let email = request.payload.email
  if (email !== undefined && email !== '') {
    query.email = email
  }
  let phone = request.payload.phone
  if (phone !== undefined && phone !== '') {
    query.phone = phone
  }
  console.log(`registerHandler: query=${JSON.stringify(query, null, 2)}`)
  const users = await controllers.user.get({'query': query, params: {}}, null)
  console.log(`registerHandler: users=${JSON.stringify(users, null, 2)}`)
  if (users.length === 0) {
    console.log('registerHandler: creating new user')
    const user = await controllers.user.create(request, h)
    return simpleRegister(user)
  }
  const nonAutoCreatedUsers = users.filter(user => user.autoCreated === false)
  if (nonAutoCreatedUsers.length !== 0) {
    let msg = "A user exists with this email or phone number"
    console.log(`registerHandler: ${msg}`)
    throw Boom.badRequest(msg)
  }
  const autoCreatedUsers = users.filter(user => user.autoCreated === true)
  console.log(`registerHandler: autoCreatedUsers=${JSON.stringify(autoCreatedUsers, null, 2)}`)
  if (autoCreatedUsers.length === 1) {
    const id = autoCreatedUsers[0].id
    const updates = request.payload
    updates.autoCreated = false
    const user = await controllers.user.update({
      params: {'id': id},
      payload: updates
    }, null)
    return simpleRegister(user)
  } else {
    let msg = "Multiple users exist that are associated with this email address and phone number"
    console.log(`registerHandler: ${msg}`)
    throw Boom.badRequest(msg)
  }
}

const validateAdmin = async (decoded, request, h) => {
  console.log(validateAdmin)
  return {isValid: true}
}

// const registerHandler = async (request, h) => {
//   const user = await controllers.user.create(request, h)
//   const token = createJwtToken(user)
//   return h.response({'id_token': token}).code(201)
// }

const reactRouterRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot',
  '/account',
  '/account/',
  '/rotations',
  '/rotations/',
  '/rotations/memberRotation/{id}',
  '/rotations/memberRotation/{id}/dashboard',
  '/rotations/memberRotation/{id}/configuration',
  '/rotations/managedRotation/{id}',
  '/rotations/managedRotation/{id}/dashboard',
  '/rotations/managedRotation/{id}/configuration',
  '/rotations/managedRotation/create',
  '/rotations/managedRotation/{id}/update'
  // '/dashboard', '/configuration',
  // '/members', '/queue',
  // '/createRotation', '/updateRotation'
]

const reactRouterAdminRoutes = [
  '/admin',
  '/admin/user/{id}',
  '/admin/user/create',
  '/admin/rotation/{id}',
  '/admin/rotation/create'
]


let routes = [
  {
    method: "POST",
    path: "/api/user",
    handler: controllers.user.create,
    options: {
      description: "Adds a new user",
      payload: {
        multipart: true,
      },
      pre: [
        { method: verifyUser }
      ]
    }
  },
  {
    method: "GET",
    path: "/api/user/{id?}",
    handler: controllers.user.get,
    config: {
      description: "Get a user by id",
    }
  },
  {
    method: "GET",
    path: "/api/user/{userId}/managedRotations",
    handler: controllers.rotation.getUserManagedRotations,
    config: {
      description: "Get rotations managed by a given user",
    }
  },
  {
    method: "GET",
    path: "/api/user/{userId}/memberRotations",
    handler: controllers.rotation.getUserMemberRotations,
    config: {
      description: "Get rotations that a user is a member of",
    }
  },
  {
    method: "GET",
    path: "/api/user/{userId}/cycleNote/{id?}",
    handler: controllers.cycleNote.get,
    config: {
      description: "Get a particular cycle note",
    }
  },
  {
    method: "POST",
    path: "/api/user/{userId}/cycleNote",
    handler: controllers.cycleNote.create,
    config: {
      description: "Create a cycle note",
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
    method: "POST",
    path: "/api/rotation",
    handler: controllers.rotation.create,
    options: {
      description: "Adds a new rotation",
      payload: {
        multipart: true,
      },
      pre: [
        { method: verifyRotation }
      ]
    }
  },
  {
    method: "GET",
    path: "/api/rotation/{id?}",
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
      description: "Deletes the selected rotation",
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
    path: "/changePassword",
    handler: changePasswordHandler,
    options: {
      description: "Change user's password",
      payload: {
        multipart: true,
      },
    }
  },
  {
    method: "POST",
    path: "/forgot",
    handler: forgotPasswordHandler,
    options: {
      description: "Generate link for password reset",
      payload: {
        multipart: true
      },
      auth: false
    }
  },
  {
    method: "GET",
    path: "/reset/{token}",
    handler: resetPasswordGetHandler,
    options: {
      description: "Verify password reset token",
      auth: false
    }
  },
  {
    method: "POST",
    path: "/reset",
    handler: resetPasswordPostHandler,
    options: {
      description: "Reset password",
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
      payload: {
        multipart: true,
      },
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

reactRouterRoutes.push(...reactRouterAdminRoutes)
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

// reactRouterAdminRoutes.forEach(routeName => {
//   routes.push(
//     {
//       method: "GET",
//       path: routeName,
//       handler: getHome,
//       config: {
//         description: "Return index.html",
//       }
//     }
//   )
// })



module.exports = routes
