const fs = require("fs")

const uuid = require("uuid")

const { User, Rotation } = require("./../models")
// const { createToken } = require('./../services/token.js')
// const { createHash } = require('./../services/hash.js')



module.exports = {
  list: async function (request, h) {
    const result = await Rotation.findAll()
    return {
      rotations: result
    }
  },
  create: async function (request, h) {
    const name = request.payload.name
    const cycleAmount = request.payload.cycleAmount
    const cycleDuration = request.payload.cycleDuration
    const managerId = request.payload.managerId
    const id = uuid.v4()

    console.log(`controllers.rotation.create: name=${name}`)

    const rotation = await Rotation.create({
      "name": name,
      "cycleAmount": cycleAmount,
      "cycleDuration": cycleDuration,
      "managerId": managerId,
      "id": id
    })
    return rotation
  },
}
