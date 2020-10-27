const { DateTime } = require('luxon')
const crypto = require('crypto')

module.exports = {
  setResetPasswordToken: async function (user, duration) {
    if (duration == null) {
      duration = {'hours': 1}
    }
    console.log(`setResetPasswordToken: creating password reset token for ${user.username}`)
    const buffer = crypto.randomBytes(20)
    const token = buffer.toString('hex')
    user.resetPasswordToken = token
    user.resetPasswordExpires = DateTime.local().plus(duration)
    await user.save()
    return user
  }
}
