const fs = require("fs")

const uuid = require("uuid")

const { User, Rotation, MemberRotation, CycleNote } = require("./../models")
const { deleteFactory, payloadGet } = require('./common.js')


const userCycleNoteInclude = {
  model: User,
  as: 'members',
  attributes: User.publicAttributes,
  include: {
    model: CycleNote,
    order: ['dateStarted', 'ASC']
  }
}

const orderByRotationIndex = [[{model: User, as: 'members'}, MemberRotation, 'rotationIndex', 'ASC']]



module.exports = {
  getUserMemberRotations: async function (request, h) {
    console.log(`controllers.rotation.getUserMemberRotations: ${request.params.userId}`)
    let includeObj = Object.assign({ where: { 'id': request.params.userId }}, userCycleNoteInclude)
    const rotations = await Rotation.findAll({
      include: includeObj,
      order: orderByRotationIndex
    })
    return rotations
  },
  getUserManagedRotations: async function (request, h) {
    console.log(`controllers.rotation.getUserManagedRotations: ${request.params.userId}`)
    const rotations = await Rotation.findAll({
      where: { managerId: request.params.userId },
      include: userCycleNoteInclude,
      order: orderByRotationIndex
    })
    return rotations
  },
  create: async function (request, h) {
    console.log('controllers.rotation.create')
    const name = request.payload.name
    const cycleAmount = request.payload.cycleAmount
    const cycleDuration = request.payload.cycleDuration
    const managerId = request.payload.managerId
    const memberIds = request.payload.memberIds
    const membersPerCycle = payloadGet(request.payload, 'membersPerCycle', 1)
    const nonPayingCycles = payloadGet(request.payload, 'nonPayingCycles', 0)

    const started = payloadGet(request.payload, 'started', false)
    const dateStarted = payloadGet(request.payload, 'dateStarted', null)

    const id = uuid.v4()

    console.log(`controllers.rotation.create: name=${name}, cycleAmount=${cycleAmount}, cycleDuration=${cycleDuration}, started=${started}, dateStarted=${dateStarted}`)

    const rotation = await Rotation.create({
      "id": id,
      "name": name,
      "cycleAmount": cycleAmount,
      "cycleDuration": cycleDuration,
      'started': started,
      'dateStarted': dateStarted,
      'membersPerCycle': membersPerCycle,
      'nonPayingCycles': nonPayingCycles
    })

    const manager = await User.findOne({where: {id: managerId}})
    await rotation.setManager(manager)
    await manager.addManagedRotation(rotation)

    if (memberIds !== undefined) {
      for (let idx=0; idx<memberIds.length; idx++) {
        let memId = memberIds[idx]
        await User.findOne({where: {id: memId}})
          .then(user => {
            console.log(`controllers.rotation.create: adding user ${user.name} with rotationIndex=${idx}`)
            return rotation.addMember(user, { through: { 'rotationIndex': idx } })
          })
      }
    }

    return rotation
  },
  update: async function (request, h) {
    console.log('controllers.rotation.update')
    const updateKeys = [
      'name',
      'cycleAmount',
      'cycleDuration',
      'started',
      'dateStarted',
      'membersPerCycle',
      'nonPayingCycles'
    ]
    const values = updateKeys.reduce((acc, cur) => {
      if (request.payload[cur] !== undefined) {
        acc[cur] = request.payload[cur]
      }
      return acc
    }, {})
    const options = {
      where: { id: request.params.id },
      include: userCycleNoteInclude,
      order: orderByRotationIndex
    }
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
      const count = await rotation.countMembers()
      let rotationIndex = count
      for (let idx=0; idx<memberIds.length; idx++) {
        let memId = memberIds[idx]
        await User.findOne({where: {id: memId}})
          .then(user => {
            return Promise.all([user, rotation.hasMember(user)])
          })
          .then(([user, hasMember]) => {
            if (! hasMember) {
              console.log(`controllers.rotation.update: adding user=${user.name} with rotationIndex=${rotationIndex}`)
              let prom = rotation.addMember(user, { through: { 'rotationIndex': rotationIndex }})
              rotationIndex++
              return prom
            }
          })
      }
    }
    return rotation
  },
  get: async function (request, h) {
    console.log('controllers.rotation.get')
    const id = request.params.id
    if (id === undefined || id === ''){
      console.log('controllers.rotation.get: getting all rotations')
      return await Rotation.findAll({
        include: userCycleNoteInclude,
        order: orderByRotationIndex
      })
    } else {
      console.log('controllers.rotation.get: getting by id')
      return await Rotation.findByPk(id, {
        include: userCycleNoteInclude,
        order: orderByRotationIndex
      })
    }
  },
  delete: deleteFactory(Rotation)
}
