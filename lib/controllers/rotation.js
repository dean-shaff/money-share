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


const addMembers = async (rotation, memberIds) => {
  for (let idx=0; idx<memberIds.length; idx++) {
    let memId = memberIds[idx]
    await User.findByPk(memId)
      .then(user => {
        console.log(`controllers.rotation.create: adding user ${user.name} with rotationIndex=${idx}`)
        return rotation.addMember(user, { through: { 'rotationIndex': idx } })
      })
  }
}


module.exports = {
  getUserMemberRotations: async function (request, h) {
    console.log(`controllers.rotation.getUserMemberRotations: ${request.params.userId}`)
    let includeObj = Object.assign({ where: { 'id': request.params.userId }}, userCycleNoteInclude)
    console.log(`controllers.rotation.getUserMemberRotations: includeObj=${JSON.stringify(includeObj, null, 2)}`)
    const rotations = await Rotation.findAll({
      include: includeObj
    })
    // return rotations
    const rotationIds = rotations.map(rot => rot.id)
    return await Rotation.findAll({
      where: { id: rotationIds },
      include: userCycleNoteInclude,
      order: orderByRotationIndex
    })
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
    const cycleAmountCurrency = payloadGet(request.payload, 'cycleAmountCurrency', 'usd')
    const cycleDuration = request.payload.cycleDuration
    const cycleDurationUnit = payloadGet(request.payload, 'cycleDurationUnit', 'days')
    const managerId = request.payload.managerId
    const memberIds = request.payload.memberIds
    const membersPerCycle = payloadGet(request.payload, 'membersPerCycle', 1)
    const nonPayingCycles = payloadGet(request.payload, 'nonPayingCycles', 0)

    const started = payloadGet(request.payload, 'started', false)
    const dateStarted = payloadGet(request.payload, 'dateStarted', null)

    const id = uuid.v4()

    console.log(`controllers.rotation.create: name=${name}, cycleAmount=${cycleAmount}, cycleDuration=${cycleDuration}, cycleDurationUnit=${cycleDurationUnit} started=${started}, dateStarted=${dateStarted}`)

    const rotation = await Rotation.create({
      "id": id,
      "name": name,
      "cycleAmount": cycleAmount,
      'cycleAmountCurrency': cycleAmountCurrency,
      "cycleDuration": cycleDuration,
      'cycleDurationUnit': cycleDurationUnit,
      'started': started,
      'dateStarted': dateStarted,
      'membersPerCycle': membersPerCycle,
      'nonPayingCycles': nonPayingCycles
    })

    const manager = await User.findOne({where: {id: managerId}})
    await rotation.setManager(manager)
    await manager.addManagedRotation(rotation)

    if (memberIds !== undefined) {
      await addMembers(rotation, memberIds)
    }

    return rotation
  },
  update: async function (request, h) {
    console.log('controllers.rotation.update')
    const updateKeys = [
      'name',
      'cycleAmount',
      'cycleAmountCurrency',
      'cycleDuration',
      'cycleDurationUnit',
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
    console.log(`controllers.rotation.update: values=${JSON.stringify(values, null, 2)}`)
    const options = {
      where: { id: request.params.id },
      include: userCycleNoteInclude,
      order: orderByRotationIndex
    }
    await Rotation.update(values, options)
    const rotation = await Rotation.findOne(options)

    if ('managerId' in request.payload) {
      console.log(`controllers.rotation.update: updating manager`)
      const managerId = request.payload.managerId
      const manager = await User.findOne({where: {id: managerId}})
      await rotation.setManager(manager)
      await manager.addManagedRotation(rotation)
    }

    if ('memberIds' in request.payload) {
      console.log(`controllers.rotation.update: updating members`)
      const memberIds = request.payload.memberIds
      const currentUsers = await rotation.getMembers()
      await rotation.removeMembers(currentUsers)
      await addMembers(rotation, memberIds)
    }
    return await Rotation.findOne(options)
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
