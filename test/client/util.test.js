// test out client utility code
const { expect } = require('@hapi/code');
const { DateTime } = require('luxon')

const { getRotationCycleInfo } = require('./../../client/src/util.js')


describe('getRotationCycleInfo', () => {
  test('membersPerCycle equal to 1', () => {
    let dateStarted = DateTime.local().minus({days: 48}).toISO()

    const rotation = {
      'dateStarted': dateStarted,
      'members': new Array(12),
      'cycleDuration': 14,
      'membersPerCycle': 1,
    }
    let obj = getRotationCycleInfo(rotation)

    expect(obj.totalCycles).to.equal(12)
    expect(obj.cycleNumber).to.equal(3)
    expect(obj.daysRemaining).to.equal(6)
  })

  test('membersPerCycle equal to 5', () => {
    let dateStarted = DateTime.local().minus({days: 48}).toISO()
    const rotation = {
      'dateStarted': dateStarted,
      'members': new Array(60),
      'cycleDuration': 28,
      'membersPerCycle': 5,
    }
    let obj = getRotationCycleInfo(rotation)

    expect(obj.totalCycles).to.equal(12)
    expect(obj.cycleNumber).to.equal(1)
    expect(obj.daysRemaining).to.equal(20)
  })

})
