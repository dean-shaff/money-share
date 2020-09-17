// token.js
const jwt = require('jsonwebtoken')

const settings = require("./../../settings.js")

module.exports = {
  createToken: function (user) {
    return jwt.sign(
      { id: user.id, username: user.username },
      settings.jwt_key,
      { algorithm: 'HS256', expiresIn: "24h" }
    )
  }
}
