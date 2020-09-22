const fs = require("fs")

const { Op } = require('sequelize')
const uuid = require("uuid")
const slug = require("slug")
const { DateTime } = require('luxon')

const { User, CycleNote } = require("./../models")
const { createToken } = require('./../services/token.js')
const { createHash } = require('./../services/hash.js')
const { deleteFactory, getFactory, payloadGet } = require('./common.js')

const modelOptions = {
  include: CycleNote,
  attributes: User.publicAttributes
}


module.exports = {
  search: async function (request, h) {
    console.log('controllers.user.search')
    const query = request.query
    // console.log(`controllers.user.search: query=${JSON.stringify(query, null, 2)}`)
    let where = []
    for (const [key, value] of Object.entries(query)) {
      let obj = {}
      obj[key] = value
      where.push(obj)
    }
    // console.log(`controllers.user.search: where=${JSON.stringify(where, null, 2)}`)
    return await User.findAll(Object.assign(
      {'where': {[Op.or]: where}}, modelOptions
    ))
  },
  create: async function (request, h) {
    console.log(`controllers.user.create`)
    const name = request.payload.name
    const email = request.payload.email
    const username = request.payload.username
    const password = request.payload.password
    const autoCreated = payloadGet(request.payload, 'autoCreated', false)
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
    console.log(`controllers.user.get: request.params.id=${request.params.id}, request.query=${JSON.stringify(request.query, null, 2)}`)
    const id = request.params.id
    if (id === undefined || id === '') {
      const ids = request.query.ids
      const usernames = request.query.usernames
      if (!ids && !usernames ) {
        console.log(`controllers.user.get: no query.ids, returning all users`)
        return await User.findAll(modelOptions)
      } else {
        console.log(`controllers.user.get: query present, returning specified users`)
        let where = ids ? { id: ids } : { username: usernames }
        let options = Object.assign({
          'where': where
        }, modelOptions)
        return await User.findAll(options)
      }
    } else {
      console.log(`controllers.user.get: getting user ${id}`)
      return await User.findByPk(id, modelOptions)
    }
  },
  delete: deleteFactory(User)
}
