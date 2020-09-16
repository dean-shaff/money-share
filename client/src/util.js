import jwtDecode from 'jwt-decode'

import moment from 'moment'

import settings from './settings.js'

const dateFormat = settings.dateFormat


export const isLoggedIn = function () {
  const token = localStorage.getItem('token')
  if (!token) {
    return false
  }
  const tokenExpiration = jwtDecode(token).exp;
  const dateNow = new Date();
  if (tokenExpiration < dateNow.getTime()/1000){
    return false
  } else {
    return true
  }
}

export const getTokenUserInfo = function () {
  const token = localStorage.getItem('token')
  if (!token) {
    return null
  }
  const parsed = jwtDecode(token)
  return parsed
}

export const roll = function (arr, places) {
  for (let idx = 0; idx < places; idx++) {
    arr.unshift(arr.pop());
  }
}

export const getCycleNumberTotalCycles = function (rotation) {
  let dateStarted = rotation.dateStarted
  let membersPerCycle = rotation.membersPerCycle
  let totalMembers = rotation.members.length
  let cycleDuration = rotation.cycleDuration

  let totalCycles = totalMembers / membersPerCycle

  let dateStartedObj = moment(dateStarted, dateFormat)
  let today = moment()

  let daysSinceStart = today.diff(dateStartedObj, 'days')
  let cycleNumber = Math.floor(daysSinceStart/cycleDuration)

  return [cycleNumber, totalCycles]
}
