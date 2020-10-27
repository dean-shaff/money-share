"use strict"

const { expect } = require('@hapi/code');
const { DateTime } = require('luxon')

const controllers = require('./../../lib/controllers')
const { init } = require("./../../lib/server.js")
const { setResetPasswordToken } = require('./../../lib/services/resetPassword.js')


describe("resetPassword", () => {
  let server
  let user

  beforeEach(async () => {
    server = await init();
    user = await controllers.user.create({
      payload: {
        name: "Dean Shaff",
        username: "deanshaff",
        email: "me@address.com",
        password: "deanshaffpassword",
      }
    })
  })

  afterEach(async () => {
    await server.stop();
  });

  test("GET /reset/{token}", async () => {
    await setResetPasswordToken(user)
    const token = user.resetPasswordToken
    const res = await server.inject({
      method: "GET",
      url: `/reset/${token}`
    })
    expect(res.statusCode).to.equal(200)
  })

  test("GET /reset/{token} with bad token", async () => {
    const token = "ffregregq"
    const res = await server.inject({
      method: "GET",
      url: `/reset/${token}`
    })
    expect(res.statusCode).to.equal(400)
  })

  test("GET /reset/{token} with expired token", async () => {
    await setResetPasswordToken(user)
    user.resetPasswordExpires = DateTime.local().minus({'hours': 1})
    await user.save()
    const token = user.resetPasswordToken
    const res = await server.inject({
      method: "GET",
      url: `/reset/${token}`
    })
    expect(res.statusCode).to.equal(400)
  })



})
