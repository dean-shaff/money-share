const fs = require("fs")

const uuid = require("uuid")
const slug = require("slug")
const { DateTime } = require('luxon')

const { User, CycleNote } = require("./../models")
const { createToken } = require('./../services/token.js')
const { createHash } = require('./../services/hash.js')
const { deleteFactory, getFactory } = require('./common.js')


module.exports = {
  list: async function (request, h) {
    console.log(`controllers.user.list`)
    const ids = request.payload.ids
    const result = await User.findAll({
      where: { id: ids },
      include: CycleNote
    })
    return {
      users: result
    }
  },
  create: async function (request, h) {
    const name = request.payload.name
    const email = request.payload.email
    const username = request.payload.username
    const password = request.payload.password
    let autoCreated = request.payload.autoCreated
    autoCreated = autoCreated === undefined ? false: autoCreated
    const id = uuid.v4()

    console.log(`controllers.user.create: username=${username}, name=${name}, email=${email}, autoCreated=${autoCreated}`)

    const user = await User.create({
      "date": DateTime.local(),
      "name": name,
      "username": username,
      "email": email,
      "id": id,
      "password": password,
      'autoCreated': autoCreated
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
      },
      include: CycleNote,
      attributes: User.publicAttributes
    }
    await User.update(values, options);
    const result = await User.findOne(options);
    console.log(`controllers.user.update: result.name=${result.name}`)
    return result
  },
  get: async function (request, h) {
    const id = request.params.id
    const obj = await User.findOne({
      where: { 'id': id },
      include: CycleNote,
      attributes: User.publicAttributes
    })
    return obj
  },
  delete: deleteFactory(User)
}
