"use strict"

const { expect } = require('@hapi/code');
const qs = require('qs')

const { init } = require("./../../../lib/server.js")
const user = require("./../../../lib/controllers/user.js")


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
    })
  })

  afterEach(async () => {
    await server.stop();
  });

  test("POST /api/user", async () => {
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
    expect(res.statusCode).to.equal(200)
  })

  test("POST /api/user with same email", async () => {
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

  test("POST /api/user with same username", async () => {
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

  test("GET /api/user/{id}", async () => {
    const res = await server.inject({
      method: "GET",
      url: `/api/user/${newUser.dataValues.id}`
    })
    expect(res.statusCode).to.equal(200)
    expect(res.result.name).to.equal("Dean Shaff")
  })

  test("GET /api/user/", async () => {
    const res = await server.inject({
      method: "GET",
      url: `/api/user/`
    })
    expect(res.statusCode).to.equal(200)
    expect(res.result[0].name).to.equal("Dean Shaff")
  })

  test("GET /api/user with query params", async () => {
    let ids = [newUser.id]
    let query = qs.stringify({id: ids})
    console.log(`GET /api/user with query params: query=${query}`)
    const res = await server.inject({
      method: "GET",
      url: `/api/user/?${query}`
    })
    expect(res.statusCode).to.equal(200)
    expect(res.result[0].name).to.equal("Dean Shaff")
  })

  test("PUT /api/user/{id}", async () => {
    const res = await server.inject({
      method: "PUT",
      url: `/api/user/${newUser.dataValues.id}`,
      payload: {
        name: "sruti"
      }
    })
    expect(res.statusCode).to.equal(200)
    expect(res.result.name).to.equal("sruti")
  })

  test("DELETE /api/user/{id}", async () => {
    const res = await server.inject({
      method: "DELETE",
      url: `/api/user/${newUser.dataValues.id}`
    })
    expect(res.statusCode).to.equal(204);
  })

})
