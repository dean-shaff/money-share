"use strict"

const { expect } = require('@hapi/code');
const { init } = require("./../../../lib/server.js")

const controllers = require("./../../../lib/controllers/")
const models = require("./../../../lib/models/")
const { authInject } = require('./util.js')


describe("rotation", () => {

  let server
  let users
  let manager
  let rotation
  let inject

  beforeAll(async () => {
    server = await init();
    let userInfo = [{
      name: 'manager',
      username: 'manager',
      email: 'manager@address.com',
      password: 'password'
    }]
    for (let idx=0; idx<10; idx++) {
      userInfo.push({
        name: `name_${idx}`,
        username: `username_${idx}`,
        email: `${idx}@address.com`,
        password: 'password'
      })
    }

    users = await Promise.all(userInfo.map(info => {
      return controllers.user.create({
        payload: info
      })
    }))
    manager = users[0]
    inject = authInject(server, manager)
  })

  beforeEach(async () => {
    rotation = await controllers.rotation.create({
      payload: {
        name: "My Rotation",
        cycleAmount: 100,
        cycleDuration: 14,
        managerId: manager.id,
        memberIds: users.slice(0, 5).map(user => user.id)
      }
    })
  })

  afterEach(async () => {
    await controllers.rotation.delete({
      params: { id: rotation.id }
    })
  })

  afterAll(async () => {
    await server.stop();
  });

  test('POST /api/rotation', async () => {
    const res = await inject({
      method: 'POST',
      url: '/api/rotation',
      payload: {
        name: "My Modified Rotation",
        cycleAmount: 100,
        cycleDuration: 14,
        managerId: users[0].id,
        memberIds: users.map(user => user.id)
      }
    })
    expect(res.statusCode).to.equal(200)
    const newRotation = res.result
    expect((await newRotation.countMembers())).to.equal(11)
    expect(newRotation.name).to.equal("My Modified Rotation")
    expect(newRotation.cycleAmount).to.equal(100)
    expect(newRotation.cycleDuration).to.equal(14)
  })

  test("PUT /api/rotation/{id}", async () => {
    const res = await inject({
      method: 'PUT',
      url: `/api/rotation/${rotation.id}`,
      payload: {
        name: "My Modified Rotation",
        cycleAmount: 200,
        cycleDuration: 28,
        managerId: users[1].id,
        memberIds: users.slice(5).map(user => user.id)
      }
    })
    expect(res.statusCode).to.equal(200)

    const rotationUpdated = res.result
    expect((await rotationUpdated.countMembers())).to.equal(6)
    expect(rotationUpdated.name).to.equal("My Modified Rotation")
    expect(rotationUpdated.cycleAmount).to.equal(200)
    expect(rotationUpdated.cycleDuration).to.equal(28)
  })

  test('GET /api/rotation/{id}', async () => {
    const res = await inject({
      method: 'GET',
      url: `/api/rotation/${rotation.id}`
    })
    expect(res.statusCode).to.equal(200)
    expect(res.result.name).to.equal('My Rotation')
    expect((await res.result.getMembers()).length).to.equal(5)
  })

  test('DELETE /api/rotation/{id}', async () => {
    const res = await inject({
      method: 'DELETE',
      url: `/api/rotation/${rotation.id}`
    })
    expect(res.statusCode).to.equal(204)
  })

  test('GET /api/user/{userId}/managedRotations', async () => {
    const res = await inject({
      method: 'GET',
      url: `/api/user/${manager.id}/managedRotations`
    })
    expect(res.statusCode).to.equal(200)
    expect((await manager.hasManagedRotation(res.result[0]))).to.equal(true)
  })

  test('GET /api/user/{userId}/memberRotations', async () => {
    const res = await inject({
      method: 'GET',
      url: `/api/user/${users[1].id}/memberRotations`
    })
    expect(res.statusCode).to.equal(200)
    const rotations = res.result
    expect(rotations[0].managerId).to.equal(manager.id)
    expect((await rotations[0].hasMember(users[1]))).to.equal(true)
  })

})
