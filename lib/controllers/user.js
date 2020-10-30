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


const cleanPhone = (val) => {
  if (val == null || val === '') {
    return null
  }
  return val.replace(/-| |\(|\)/g, '')
}

module.exports = {
  // search: async function (request, h) {
  //   console.log('controllers.user.search')
  //   const query = request.query
  //   // console.log(`controllers.user.search: query=${JSON.stringify(query, null, 2)}`)
  //   const where = Object.entries(query).map(([key, value]) => ({[key]: value}))
  //   // const where = Object.entries(query).map(([key, value]) => value)
  //   console.log(`controllers.user.search: where=${JSON.stringify(where, null, 2)}`)
  //   return await User.findAll(Object.assign(
  //     {'where': {[Op.or]: where}}, modelOptions
  //   ))
  // },
  create: async function (request, h) {
    console.log(`controllers.user.create`)
    const name = request.payload.name
    const email = request.payload.email
    const username = request.payload.username
    const password = request.payload.password
    const phone = cleanPhone(request.payload.phone)
    const autoCreated = payloadGet(request.payload, 'autoCreated', false)
    const admin = payloadGet(request.payload, 'admin', false)
    const id = uuid.v4()
    console.log(`controllers.user.create: username=${username}, name=${name}, email=${email}, autoCreated=${autoCreated}`)

    await User.create({
      "date": DateTime.local(),
      "name": name,
      "username": username,
      "email": email,
      "phone": phone,
      "id": id,
      "password": password,
      'autoCreated': autoCreated,
      'admin': admin
    })
    return await User.findByPk(id, modelOptions)
  },
  update: async function (request, h) {
    const id = request.params.id
    console.log(`controllers.user.update: request.params.id=${id}`)
    const keys = ['name', 'username', 'phone', 'email', 'autoCreated', 'admin']
    const user = await User.findByPk(id)
    keys.forEach(key => {
      if (request.payload[key] !== undefined) {
        let val = request.payload[key]
        if (key === 'phone') {
          val = cleanPhone(val)
        }
        console.log(`controllers.user.update: updating ${key} to ${val}`)
        user[key] = val
      }
    })

    if (request.payload.password !== undefined) {
      user.password = await createHash(request.payload.password)
    }
    await user.save()
    return User.findByPk(id, modelOptions)
  },
  get: async function (request, h) {
    console.log(`controllers.user.get: request.params.id=${request.params.id}, request.query=${JSON.stringify(request.query, null, 2)}`)
    const id = request.params.id
    if (id === undefined || id === '') {
      if (Object.keys(request.query).length === 0) {
        console.log(`controllers.user.get: no query.ids, returning all users`)
        return await User.findAll(modelOptions)
      } else {
        console.log(`controllers.user.get: query present, returning specified users`)
        const where = Object.entries(request.query).map(([key, value]) => {
          if (key === 'phone') {
            if (Array.isArray(value)) {
              value = value.map(cleanPhone)
            } else {
              value = cleanPhone(value)
            }
          }

          console.log(value)


          return {[key]: value}
        })
        console.log(`controllers.user.get: where=${JSON.stringify(where, null, 2)}`)
        return await User.findAll(Object.assign(
          {'where': {[Op.or]: where}}, modelOptions
        ))
      }
    } else {
      console.log(`controllers.user.get: getting user ${id}`)
      return await User.findByPk(id, modelOptions)
    }
  },
  delete: deleteFactory(User)
}
