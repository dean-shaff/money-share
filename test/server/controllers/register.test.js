"use strict"

const { expect } = require('@hapi/code');
const controllers = require('./../../../lib/controllers')

const { init } = require("./../../../lib/server.js")


describe("register", () => {

  let server
  let newAutoCreatedUser
  let newUser
  let inject

  beforeAll(async () => {
    server = await init();
  })

  beforeEach(async () => {
    newAutoCreatedUser = await controllers.user.create({
      payload: {
        name: "Dean Shaff",
        username: "deanshaff",
        email: "deanshaff@address.com",
        autoCreated: true
      }
    })
    newUser = await controllers.user.create({
      payload: {
        name: "Jose Montero",
        username: "josemontero",
        email: "josemontero@address.com",
        autoCreated: false
      }
    })
  })

  afterEach(async () => {
    await Promise.all([
      controllers.user.delete({ params: {id: newAutoCreatedUser.id }}),
      controllers.user.delete({ params: {id: newUser.id }})
    ])
  })


  afterAll(async () => {
    await server.stop();
  });

  test("POST /register with existing user", async () => {
    let res = await server.inject({
      method: "POST",
      url: "/register",
      payload: {
        email: "deanshaff@address.com",
        username: 'dillpickle',
        name: 'Dill Pickle',
        password: "password"
      }
    })
    expect(res.statusCode).to.equal(201)
  })

  test("POST /register throws error when trying to update existing user", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/register",
      payload: {
        email: newUser.email
      }
    })
    expect(res.statusCode).to.equal(400)
  })

  test("POST /register", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/register",
      payload: {
        username: "firstlast",
        name: "first last",
        email: "first.last@address.com",
        password: "firstlastpassword"
      }
    })
    expect(res.statusCode).to.equal(201)
  })


})
