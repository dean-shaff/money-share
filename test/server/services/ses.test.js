"use strict"

const { expect } = require('@hapi/code');

const settings = require('./../../../settings.js')
const ses = require('./../../../lib/services/ses.js')


describe("ses", () => {
  test("can send mail", async () => {
    const fromAddress = settings.aws.fromAddress
    const toAddress = 'dean.shaff@gmail.com'
    const subject = 'test'
    const body = 'test body'
    await ses.sendMail(fromAddress, toAddress, subject, body)
  })
})
