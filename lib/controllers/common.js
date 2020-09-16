module.exports = {
  deleteFactory: function (constructor) {
    return async function (request, h) {
      const res = await constructor['destroy']({
        where: {
          id: request.params.id
        }
      })
      return ''
    }
  },
  getFactory: function (constructor) {
    return async function (request, h) {
      const id = request.params.id
      const obj = await constructor['findOne']({
        where: { 'id': id }
      })
      return obj
    }
  }
}
