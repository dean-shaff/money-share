const fs = require("fs")

const uuid = require("uuid")

const { User, Rotation } = require("./../models")
// const { createToken } = require('./../services/token.js')
// const { createHash } = require('./../services/hash.js')



module.exports = {
  list: async function (request, h) {
    const ids = request.payload.ids
    const result = await Rotation.findAll({
      where: { id: ids }
    })
    return {
      rotations: result
    }
  },
  create: async function (request, h) {
    const name = request.payload.name
    const cycleAmount = request.payload.cycleAmount
    const cycleDuration = request.payload.cycleDuration
    const managerId = request.payload.managerId
    const memberIds = request.payload.memberIds

    const id = uuid.v4()

    console.log(`controllers.rotation.create: name=${name}`)

    const rotation = await Rotation.create({
      "name": name,
      "cycleAmount": cycleAmount,
      "cycleDuration": cycleDuration,
      "id": id
    })

    const manager = await User.findOne({where: {id: managerId}})
    await rotation.setManager(manager)
    await manager.addManagedRotation(rotation)

    await Promise.all(memberIds.map(memId => {
      return User.findOne({where: {id: memId}}).then(user => rotation.addMember(user))
    }))

    return rotation
  },
  update: async function (request, h) {
    console.log('controllers.rotation.update')
    const updateKeys = ['name', 'cycleAmount', 'cycleDuration']
    const values = updateKeys.reduce((acc, cur) => {
      if (request.payload[cur] !== undefined) {
        acc[cur] = request.payload[cur]
      }
      return acc
    }, {})
    const options = { where: { id: request.params.id } }
    await Rotation.update(values, options)
    const rotation = await Rotation.findOne(options)

    if ('managerId' in request.payload) {
      const managerId = request.payload.managerId
      const manager = await User.findOne({where: {id: managerId}})
      await rotation.setManager(manager)
      await manager.addManagedRotation(rotation)
    }

    if ('memberIds' in request.payload) {
      const memberIds = request.payload.memberIds
      await Promise.all(memberIds.map(memId => {
        return User.findOne({where: {id: memId}}).then(user => rotation.addMember(user))
      }))
    }
    return rotation
  },
  get: async function (request, h) {
    console.log('controllers.rotation.get')
    const rotation = await Rotation.findOne({
      where: { id: request.params.id }
    })
    return rotation
  },
  delete: async function (request, h) {
    console.log('controllers.rotation.delete')
    const res = await Rotation.destroy({
      where: { id: request.params.id }
    })
    return ""
  },
  getUserRotations: async function (request, h) {
    console.log('controllers.rotation.getUserRotations')
    const rotations = await Rotation.findAll({
      where: { managerId: request.params.id },
      include: {model: User, as: 'members'}
    })
    return rotations
  }
}
