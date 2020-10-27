
const { createJwtToken } = require('./../../../lib/services/token.js')


module.exports = {
  authInject: function (server, user) {
    const token = createJwtToken(user)
    const headers = {
      'Authorization': token
    }
    return async (options) => {
      if ('headers' in options) {
        options.headers = Object.assign(headers, options.headers)
      } else {
        options.headers = headers
      }
      return server.inject(options)
    }
  }
}
