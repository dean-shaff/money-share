const fs = require("fs")

const uuid = require("uuid")
const slug = require("slug")

const { User } = require("./../models")
const { createToken } = require('./../services/token.js')
const { createHash } = require('./../services/hash.js')


module.exports = {
  list: async function (request, h) {
    const result = await User.findAll()
    return {
      users: result
    }
  },
  create: async function (request, h) {
    const name = request.payload.name
    const email = request.payload.email
    const username = request.payload.username
    const password = request.payload.password
    const id = uuid.v4()

    console.log(`controllers.user.create: username=${username}, name=${name}, email=${email}`)

    const user = await User.create({
      "date": new Date(),
      "name": name,
      "username": username,
      "email": email,
      "id": id,
      "password": password
    })
    return user
  },
  update: async function (request, h) {
    // console.log(`controllers.user.update`)
    const values = {
      name: request.payload.name
    }
    if ('password' in request.payload) {
      values['password'] = createHash(request.payload.password)
    }
    const options = {
      where: {
        id: request.params.id
      }
    }
    await User.update(values, options);
    const result = await User.findOne(options);
    console.log(`controllers.user.update: result.name=${result.name}`)
    return result
  },
  get: async function (request, h) {
    const note = await User.findOne({
      where: {
        id: request.params.id
      }
    })
    return note
  },
  delete: async function (request, h) {
    const res = await User.destroy({
      where: {
        id: request.params.id
      }
    })
    return ""
  }
}
