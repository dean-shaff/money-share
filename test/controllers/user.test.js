"use strict"

const { expect } = require('@hapi/code');
const { init } = require("./../../lib/server.js")

const user = require("./../../lib/controllers/user.js")


describe("user", () => {

  let server
  let newUser

  beforeEach(async () => {
    server = await init();
    newUser = await user.create({
      payload: {
        name: "Dean Shaff",
        username: "deanshaff",
        email: "me@address.com",
        password: "deanshaffpassword"
      }
    }, {'response': () => {return {'code': () => {}}}})
  })

  afterEach(async () => {
    await server.stop();
  });

  test("POST /user", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/user",
      payload: {
        username: "firstlast",
        name: "first last",
        email: "first.last@address.com",
        password: "firstlastpassword"
      }
    })
  })

  test("POST /user with same email", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/user",
      payload: {
        username: "firstlast",
        name: "first last",
        email: "me@address.com",
        password: "firstlastpassword"
      }
    })
    expect(res.statusCode).to.equal(400);
  })

  test("POST /user with same username", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/user",
      payload: {
        username: "deanshaff",
        name: "first last",
        email: "first.last@address.com",
        password: "firstlastpassword"
      }
    })
    expect(res.statusCode).to.equal(400);
  })

  test("GET /user/{id}", async () => {
    const res = await server.inject({
      method: "GET",
      url: `/api/user/${newUser.dataValues.id}`
    })
    expect(res.result.name).to.equal("Dean Shaff")
  })

  test("PUT /user/{id}", async () => {
    const res = await server.inject({
      method: "PUT",
      url: `/api/user/${newUser.dataValues.id}`,
      payload: {
        name: "sruti"
      }
    })
    expect(res.result.name).to.equal("sruti")
  })

  test("DELETE /user/{id}", async () => {
    const res = await server.inject({
      method: "DELETE",
      url: `/api/user/${newUser.dataValues.id}`
    })
    expect(res.statusCode).to.equal(204);
  })

})
