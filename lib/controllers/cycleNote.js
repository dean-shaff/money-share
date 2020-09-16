const moment = require('moment')

const { CycleNote, User } = require('./../models')


module.exports = {
  list: async function (request, h) {

  },
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
  get: async function (request, h) {
    const id = request.params.id
    const cycleNote = await CycleNote.findOne({
      where: { id: id }
    })
    return cycleNote
  },
  create: async function (request, h) {
    const userId = request.params.userId
    const rotationId = request.payload.rotationId
    const datePaid = request.payload.datePaid
    const amountPaid = request.payload.amountPaid

    const cycleNote = await CycleNote.create({
      'rotationId': rotationId,
      'datePaid': datePaid,
      'amountPaid': amountPaid
    })
    const user = await User.findOne({ where: { id: userId } })
    await cycleNote.setUser(user)
    await user.addCycleNote(cycleNote)
    return cycleNote
  },
  update: async function (request, h) {
    const id = request.params.id

  },
  delete: async function (request, h) {
    const id = request.params.id
    const res = await CycleNote.destroy({
      where: {
        id: request.params.id
      }
    })
  }
}
