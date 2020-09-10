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
    })
  })

  afterEach(async () => {
    await server.stop();
  });

  test("POST /user", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/user",
      payload: {
        username: "firstlast",
        name: "first last",
        email: "first.last@address.com",
        password: "firstlastpassword"
      }
    })
  })

  test("GET /user/{id}", async () => {
    const res = await server.inject({
      method: "GET",
      url: `/user/${newUser.dataValues.id}`
    })
    expect(res.result.name === "Dean Shaff")
  })

  test("PUT /user/{id}", async () => {
    const res = await server.inject({
      method: "GET",
      url: `/user/${newUser.dataValues.id}`,
      payload: {
        name: "sruti"
      }
    })
    expect(res.result.name == "sruti")
  })

  test("DELETE /user/{id}", async () => {
    const res = await server.inject({
      method: "DELETE",
      url: `/user/${newUser.dataValues.id}`
    })
    expect(res.statusCode).to.equal(204);
  })

})
