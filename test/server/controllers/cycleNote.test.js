"use strict"

const { DateTime } = require('luxon')
const { expect } = require('@hapi/code');
const { init } = require("./../../../lib/server.js")

const controllers = require("./../../../lib/controllers/")
const { authInject } = require('./util.js')


describe("cycleNote", () => {

  const rotationId = '0'
  let server
  let newUser
  let newCycleNote
  let inject

  beforeEach(async () => {
    server = await init();
    newUser = await controllers.user.create({
      payload: {
        name: "Dean Shaff",
        username: "deanshaff",
        email: "me@address.com",
        password: "deanshaffpassword"
      }
    })

    newCycleNote = await controllers.cycleNote.create({
      params: {
        userId: newUser.id
      },
      payload: {
        'datePaid': DateTime.local(),
        'amountPaid': 100.0,
        'rotationId': rotationId
      }
    })

    inject = authInject(server, newUser)

  })

  afterEach(async () => {
    await server.stop();
  });

  test("POST /api/user/{userId}/cycleNote", async () => {
    // console.log("POST /api/user/{userId}/cycleNote")
    const res = await inject({
      method: 'POST',
      url: `/api/user/${newUser.id}/cycleNote`,
      payload: {
        'datePaid': DateTime.local(),
        'amountPaid': 100.0,
        'rotationId': rotationId
      }
    })
    expect(res.statusCode).to.equal(200)
  })

  test("POST /api/user/{userId}/cycleNote without rotation Id", async () => {
    const res = await inject({
      method: 'POST',
      url: `/api/user/${newUser.id}/cycleNote`,
      payload: {
        'datePaid': DateTime.local(),
        'amountPaid': 100.0
      }
    })
    expect(res.statusCode).to.equal(400)
  })
  test("GET /api/user/{userId}/cycleNote/{id}", async () => {
    const res = await inject({
      method: "GET",
      url: `/api/user/${newUser.dataValues.id}/cycleNote/${newCycleNote.id}`
    })
    expect(res.statusCode).to.equal(200)
    expect(res.result.amountPaid).to.equal(100.0)
  })

  test("PUT /user/{id}", async () => {
    const res = await inject({
      method: "PUT",
      url: `/api/user/${newUser.dataValues.id}/cycleNote/${newCycleNote.id}`,
      payload: {
        amountPaid: 200.0
      }
    })
    expect(res.statusCode).to.equal(200)
    expect(res.result.amountPaid).to.equal(200.0)
  })

  test("DELETE /api/users/{userId}/cycleNote", async () => {

    const res = await inject({
      method: 'DELETE',
      url: `/api/user/${newUser.id}/cycleNote/${newCycleNote.id}`
    })
    expect(res.statusCode).to.equal(204)
  })

})
