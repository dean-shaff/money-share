"use strict"

const { expect } = require('@hapi/code');
const qs = require('qs')

const { init } = require("./../../../lib/server.js")
const user = require("./../../../lib/controllers/user.js")
const { authInject } = require('./util.js')

describe("user", () => {

  let server
  let newUser
  let inject

  beforeEach(async () => {
    server = await init();
    newUser = await user.create({
      payload: {
        name: "Dean Shaff",
        username: "deanshaff",
        email: "me@address.com",
        password: "deanshaffpassword",
        phone: '6516453822'
      }
    })
    inject = authInject(server, newUser)
  })

  afterEach(async () => {
    await server.stop();
  });

  test("POST /api/user", async () => {
    const res = await inject({
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
    const res = await inject({
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
    const res = await inject({
      method: "POST",
      url: "/api/user",
      payload: {
        username: "deanshaff",
        name: "first last",
        email: "first.last@address.com",
        password: "firstlastpassword",
        phone: '7-7-9-0000-989'
      }
    })
    expect(res.statusCode).to.equal(400);
    expect(res.result.phone).to.equal('7790000989')
  })

  test("GET /api/user/{id}", async () => {
    const res = await inject({
      method: "GET",
      url: `/api/user/${newUser.dataValues.id}`
    })
    expect(res.statusCode).to.equal(200)
    expect(res.result.name).to.equal("Dean Shaff")
  })

  test("GET /api/user/", async () => {
    const res = await inject({
      method: "GET",
      url: `/api/user/`
    })
    expect(res.statusCode).to.equal(200)
    expect(res.result[0].name).to.equal("Dean Shaff")
  })


  test("GET /api/user with id query params", async () => {
    let ids = [newUser.id]
    let query = qs.stringify({id: ids})
    console.log(`GET /api/user with query params: query=${query}`)
    const res = await inject({
      method: "GET",
      url: `/api/user/?${query}`
    })
    expect(res.statusCode).to.equal(200)
    expect(res.result[0].name).to.equal("Dean Shaff")
  })

  test("GET /api/user with username query params", async () => {
    let usernames = [newUser.username]
    let query = qs.stringify({username: usernames})
    console.log(`GET /api/user with query params: query=${query}`)
    const res = await inject({
      method: "GET",
      url: `/api/user/?${query}`
    })
    expect(res.statusCode).to.equal(200)
    expect(res.result[0].name).to.equal("Dean Shaff")
  })

  test("GET /api/user with name query params", async () => {
    let query = qs.stringify({'name': ['Dean Shaff', 'dean shaff']})
    console.log(`GET /api/user: query=${query}`)
    const res = await inject({
      method: "GET",
      url: `/api/user/?${query}`
    })
    expect(res.statusCode).to.equal(200)
    expect(res.result[0].name).to.equal("Dean Shaff")
  })

  test("GET /api/user with phone query params", async () => {
    let query = qs.stringify({'phone': ['651-645-3822']})
    console.log(`GET /api/user: query=${query}`)
    const res = await inject({
      method: "GET",
      url: `/api/user/?${query}`
    })
    expect(res.statusCode).to.equal(200)
    expect(res.result[0].name).to.equal("Dean Shaff")
  })

  test("PUT /api/user/{id}", async () => {
    const res = await inject({
      method: "PUT",
      url: `/api/user/${newUser.dataValues.id}`,
      payload: {
        name: "sruti",
        phone: '651-659-0920',
        password: 'sruti1'
      }
    })
    console.log(JSON.stringify(res.result, null, 2))
    expect(res.statusCode).to.equal(200)
    expect(res.result.name).to.equal("sruti")
    expect(res.result.phone).to.equal('6516590920')
  })

  test("DELETE /api/user/{id}", async () => {
    const res = await inject({
      method: "DELETE",
      url: `/api/user/${newUser.dataValues.id}`
    })
    expect(res.statusCode).to.equal(204);
  })

  test("POST /changePassword", async () => {
    const res = await inject({
      method: 'POST',
      url: `/changePassword`,
      payload: {
        id: newUser.dataValues.id,
        oldPassword: 'deanshaffpassword',
        password: 'deanshaffpassword1'
      }
    })
    expect(res.statusCode).to.equal(201)
  })

})
