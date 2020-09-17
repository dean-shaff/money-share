const uuid = require("uuid")
const Boom = require('@hapi/boom')

const { CycleNote, User } = require('./../models')
const { deleteFactory, getFactory } = require('./common.js')

module.exports = {
  // list: async function (request, h) {
  //   console.log(`controllers.cycleNote.list`)
  //   const ids = request.payload.ids
  //   const result = await CycleNote.findAll({
  //     where: { id: ids }
  //   })
  //   return {
  //     cycleNotes: result
  //   }
  // },
  getUserCycleNotes: async function (request, h) {
    console.log(`controllers.users.getUserCycleNotes`)
    const userId = request.params.userId
    where = { 'userId': userId }
    if ('rotationId' in request.query) {
      const rotationID = request.query.rotationId
      where = {
        [Op.and]: [
          { 'userId': userId },
          { 'rotationId': request.query.rotationId }
        ]
      }
    }
    const result = await CycleNote.findAll({
      'where': where
    })
    return {
      cycleNotes: result
    }
  },
  create: async function (request, h) {
    const rotationId = request.payload.rotationId
    if (rotationId == null) {
      throw Boom.badRequest('Need to provide rotationId when creating CycleNote')
    }
    const userId = request.params.userId
    const datePaid = request.payload.datePaid
    const amountPaid = request.payload.amountPaid
    const id = uuid.v4()
    console.log(`controllers.cycleNote.create: datePaid=${datePaid}, amountPaid=${amountPaid}`)

    const cycleNote = await CycleNote.create({
      'rotationId': rotationId,
      'datePaid': datePaid,
      'amountPaid': amountPaid,
      'id': id
    })

    const user = await User.findOne({ where: { id: userId } })
    await cycleNote.setUser(user)
    await user.addCycleNote(cycleNote)
    return cycleNote
  },
  update: async function (request, h) {
    const options = { where: { id: request.params.id } }
    const values = {
      datePaid: request.payload.datePaid,
      amountPaid: request.payload.amountPaid
    }
    await CycleNote.update(values, options)
    const cycleNote = await CycleNote.findOne(options)
    return cycleNote
  },
  get: getFactory(CycleNote),
  delete: deleteFactory(CycleNote)
}
