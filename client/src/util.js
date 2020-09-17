import jwtDecode from 'jwt-decode'

import { DateTime } from 'luxon'



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

/**
 * Get the current cycle number, the total number of cycles in the rotation,
 * the number of days remaining in the cycle, and this cycle's start date
 * @param  {[type]} rotation rotation object.
 * @param  {[type]} todayFunction function to generate today. Defaults to moment constructor
 * @return {[type]}          [description]
 */
export const getRotationCycleInfo = function (rotation, todayFunction) {
  if (todayFunction == null) {
    todayFunction = DateTime.local
  }
  let dateStarted = rotation.dateStarted
  let membersPerCycle = rotation.membersPerCycle
  let totalMembers = rotation.members.length
  let cycleDuration = rotation.cycleDuration

  let totalCycles = totalMembers / membersPerCycle

  let dateStartedObj = DateTime.fromISO(dateStarted)
  let today = todayFunction()

  let daysSinceStart = Math.floor(today.diff(dateStartedObj, 'days').toObject().days)
  let cycleNumber = Math.floor(daysSinceStart/cycleDuration)

  let daysRemaining = daysSinceStart % cycleDuration
  let cycleStartDate = dateStartedObj.plus({days: cycleNumber*cycleDuration})

  console.log(`util.getRotationCycleInfo: cycleNumber=${cycleNumber}, totalCycles=${totalCycles}, daysRemaining=${daysRemaining}`)

  return {cycleNumber, totalCycles, daysRemaining, cycleStartDate}

}


export const deleteNote = function (userId, noteId) {
  console.log(`util.deleteNote`)
  return fetch(`/api/user/${userId}/cycleNote/${noteId}`, {
    method: 'DELETE'
  })
}

export const createNote = function (userId, rotationId, datePaid, amountPaid) {
  console.log(`util.createNote`)
  return fetch(`/api/user/${userId}/cycleNote`, {
    method: 'POST',
    body: JSON.stringify({
      'rotationId': rotationId,
      'datePaid': datePaid,
      'amountPaid': amountPaid
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
