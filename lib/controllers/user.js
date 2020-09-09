const fs = require("fs")

const uuid = require("uuid")
const slug = require("slug")

const { User } = require("./../models")

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
    const id = uuid.v4()
    console.log(`controllers.user.create: name=${name}, email=${email}`)

    const result = await User.create({
      "date": new Date(),
      "name": name,
      "email": email,
      "id": id
    })

    return result
  },
  update: async function (request, h) {
    const values = {
      name: request.payload.name,
      email: request.payload.email,
    };

    const options = {
      where: {
        id: request.params.id
      }
    };

    await User.update(values, options);
    const result = await User.findOne(options);
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
