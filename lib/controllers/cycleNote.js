const uuid = require("uuid")
const Boom = require('@hapi/boom')

const { CycleNote, User } = require('./../models')
const { deleteFactory } = require('./common.js')

module.exports = {
  get: async function (request, h) {
    console.log(`controllers.users.get`)
    const userId = request.params.userId
    const id = request.params.id
    if (id === undefined || id === '') {
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
      return await CycleNote.findAll({
        'where': where
      })
    } else {
      return await CycleNote.findByPk(id)
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

    const user = await User.findByPk(userId)
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
  delete: deleteFactory(CycleNote)
}
