"use strict"

const { expect } = require('@hapi/code');
const { init } = require("./../../lib/server.js")

const controllers = require("./../../lib/controllers/")
const models = require("./../../lib/models/")


describe("rotation", () => {

  let server
  let newUser

  let users = [{
    name: 'manager',
    username: 'manager',
    email: 'manager@address.com',
    password: 'password'
  }]
  for (let idx=0; idx<10; idx++) {
    users.push({
      name: `name_${idx}`,
      username: `username_${idx}`,
      email: `${idx}@address.com`,
      password: 'password'
    })
  }
  let createdUsers
  let manager
  beforeAll(async () => {
    server = await init();
    createdUsers = await Promise.all(users.map(info => {
      return controllers.user.create({
        payload: info
      })
    }))
    manager = createdUsers[0]
  })

  afterEach(async () => {
    await server.stop();
  });

  test("rotation.create", async () => {
    let rotation = await controllers.rotation.create({
      payload: {
        name: "My Rotation",
        cycleAmount: 100,
        cycleDuration: 14,
        managerId: manager.id
      }
    })
    console.log(await rotation.getManager())
    console.log(await manager.getRotations())
  })
  // test("POST /user", async () => {
  //   const res = await server.inject({
  //     method: "POST",
  //     url: "/api/user",
  //     payload: {
  //       username: "firstlast",
  //       name: "first last",
  //       email: "first.last@address.com",
  //       password: "firstlastpassword"
  //     }
  //   })
  // })
  //
  // test("POST /user with same email", async () => {
  //   const res = await server.inject({
  //     method: "POST",
  //     url: "/api/user",
  //     payload: {
  //       username: "firstlast",
  //       name: "first last",
  //       email: "me@address.com",
  //       password: "firstlastpassword"
  //     }
  //   })
  //   expect(res.statusCode).to.equal(400);
  // })
  //
  // test("POST /user with same username", async () => {
  //   const res = await server.inject({
  //     method: "POST",
  //     url: "/api/user",
  //     payload: {
  //       username: "deanshaff",
  //       name: "first last",
  //       email: "first.last@address.com",
  //       password: "firstlastpassword"
  //     }
  //   })
  //   expect(res.statusCode).to.equal(400);
  // })
  //
  // test("GET /user/{id}", async () => {
  //   const res = await server.inject({
  //     method: "GET",
  //     url: `/api/user/${newUser.dataValues.id}`
  //   })
  //   expect(res.result.name).to.equal("Dean Shaff")
  // })
  //
  // test("PUT /user/{id}", async () => {
  //   const res = await server.inject({
  //     method: "PUT",
  //     url: `/api/user/${newUser.dataValues.id}`,
  //     payload: {
  //       name: "sruti"
  //     }
  //   })
  //   expect(res.result.name).to.equal("sruti")
  // })
  //
  // test("DELETE /user/{id}", async () => {
  //   const res = await server.inject({
  //     method: "DELETE",
  //     url: `/api/user/${newUser.dataValues.id}`
  //   })
  //   expect(res.statusCode).to.equal(204);
  // })

})
