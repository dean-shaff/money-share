// ensure /forgot route works as expected
"use strict"

const { expect } = require('@hapi/code');
const qs = require('qs')

const controllers = require('./../../lib/controllers')
const { init } = require("./../../lib/server.js")


describe("forgotPassword", () => {
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

  test("POST /forgot", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/forgot",
      payload: {
        email: "me@address.com",
      }
    })
    expect(res.statusCode).to.equal(200)
  })

  test("POST /forgot with bad email", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/forgot",
      payload: {
        email: "fake@address.com",
      }
    })
    expect(res.statusCode).to.equal(400)
  })

})
