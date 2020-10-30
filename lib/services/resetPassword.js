const crypto = require('crypto')

const { DateTime } = require('luxon')

module.exports = {
  setResetPasswordToken: async function (user, duration) {
    if (duration == null) {
      duration = {'hours': 1}
    }
    console.log(`setResetPasswordToken: creating password reset token for ${user.username}`)
    const buffer = crypto.randomBytes(20)
    const token = buffer.toString('hex')

    try {
      user.resetPasswordToken = token
      user.resetPasswordExpires = DateTime.local().plus(duration)
      await user.save()
      await user.reload()
    } catch (err) {
      console.log(err)
      throw err
    }

    console.log(`setResetPasswordToken: set token to ${user.resetPasswordToken}, expires on ${user.resetPasswordExpires}`)
    return user
  }
}
