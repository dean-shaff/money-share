"use strict"

const { expect } = require('@hapi/code');
const { init } = require("./../../lib/server.js")

const controllers = require("./../../lib/controllers/")
const models = require("./../../lib/models/")


describe("rotation", () => {

  let server
  let users
  let manager
  let rotation

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

  afterAll(async () => {
    await server.stop();
  });

  test("rotation.update", async () => {
    await controllers.rotation.update({
      payload: {
        name: "My Modified Rotation",
        cycleAmount: 200,
        cycleDuration: 28,
        managerId: users[1].id,
        memberIds: users.slice(5).map(user => user.id)
      },
      params: { id: rotation.id }
    })
    let rotationUpdated = await controllers.rotation.get({
      params: { id: rotation.id }
    })

    expect((await rotationUpdated.getMembers()).length).to.equal(11)
    expect(rotationUpdated.name).to.equal("My Modified Rotation")
    expect(rotationUpdated.cycleAmount).to.equal(200)
    expect(rotationUpdated.cycleDuration).to.equal(28)
  })

  test('rotation.get', async () => {
    const gotRotation = await controllers.rotation.get({
      params: {
        id: rotation.id
      }
    })
    expect(gotRotation.name).to.equal('My Rotation')
    expect((await gotRotation.getMembers()).length).to.equal(5)
  })

  test('rotation.delete', async () => {
    await controllers.rotation.delete({
      params: { id: rotation.id }
    })
  })
})
