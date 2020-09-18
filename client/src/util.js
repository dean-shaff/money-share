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

export const authFetch = async function (url, options) {
  const token = localStorage.getItem('token')
  const authOptions = {
    'Authorization': token
  }
  if (options == null) {
    options = {}
  }
  if ('headers' in options) {
    options.headers = Object.assign(options.headers, authOptions)
  } else {
    options.headers = authOptions
  }
  options = Object.assign(options)
  // console.log(`authFetch: options.headers=${JSON.stringify(options.headers, null, 2)}`)
  return fetch(url, Object.assign(authOptions, options))
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

export const computeMembersPaid = function (rotation) {

  const dateCompare = (a, b) => {
    let dateA = DateTime.fromISO(a.datePaid)
    let dateB = DateTime.fromISO(b.datePaid)
    if (dateA > dateB) {
      return 1
    } else if (dateA.toMillis() === dateB.toMillis()) {
      return 0
    } else {
      return -1
    }
  }

  const rotationIndexCompare = (a, b) => {
    let idxA = a.MemberRotation.rotationIndex
    let idxB = b.MemberRotation.rotationIndex
    if (idxA > idxB) {
      return 1
    } else if (idxA === idxB) {
      return 0
    } else {
      return -1
    }
  }

  let dateStarted = DateTime.fromISO(rotation.dateStarted)
  let {cycleNumber, totalCycles, daysRemaining, cycleStartDate} = getRotationCycleInfo(rotation)
  rotation.members.sort(rotationIndexCompare)
  roll(rotation.members, cycleNumber*rotation.membersPerCycle)

  let notPayingThresh = rotation.members.length - rotation.membersPerCycle*rotation.nonPayingCycles

  for (let idx=0; idx<rotation.members.length; idx++) {
    if (idx >= notPayingThresh) {
      rotation.members[idx].nonPaying = true
    } else {
      rotation.members[idx].nonPaying = false
    }

    let notes = rotation.members[idx].CycleNotes
    rotation.members[idx].paid = false

    if (notes.length > 0) {
      notes.sort(dateCompare)
      let mostRecent = notes[notes.length - 1]
      let mostRecentPaid = DateTime.fromISO(mostRecent.datePaid)
      if (mostRecentPaid >= cycleStartDate) {
        rotation.members[idx].paid = true
      }
      rotation.members[idx].CycleNotes = notes
    }
  }

  return {rotation, cycleNumber, totalCycles, daysRemaining, cycleStartDate}
}


export const deleteNote = function (userId, noteId) {
  console.log(`util.deleteNote: userId=${userId}, noteId=${noteId}`)
  return authFetch(`/api/user/${userId}/cycleNote/${noteId}`, {
    method: 'DELETE'
  })
}


export const createNote = function (userId, rotationId, datePaid, amountPaid) {
  console.log(`util.createNote: userId=${userId}, rotationId=${rotationId}, datePaid=${datePaid}, amountPaid=${amountPaid}`)
  return authFetch(`/api/user/${userId}/cycleNote`, {
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

export const getDefault = function (obj, key, defaultVal) {
  if (obj[key] === undefined) {
    return defaultValue
  } else {
    return obj[key]
  }
}
