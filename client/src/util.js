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

const handleErrors = (resp) => {
  if (! resp.ok) {
    throw Error(resp.status)
  }
  return resp
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
  return fetch(url, Object.assign(authOptions, options)).then(handleErrors)
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

  let cycleDurationUnit = rotation.cycleDurationUnit
  if (cycleDurationUnit === undefined) {
    cycleDurationUnit = 'days'
  }
  cycleDurationUnit = cycleDurationUnit.toLowerCase()
  if (! ['days', 'weeks', 'months'].includes(cycleDurationUnit)) {
    cycleDurationUnit = 'days'
  }
  console.log(`util.getRotationCycleInfo: dateStarted=${dateStarted}, membersPerCycle=${membersPerCycle}, cycleDuration=${cycleDuration}, cycleDurationUnit=${cycleDurationUnit}`)
  let totalCycles = totalMembers / membersPerCycle

  let dateStartedObj = DateTime.fromISO(dateStarted)
  let today = todayFunction()

  let unitsSinceStart = Math.floor(today.diff(dateStartedObj, cycleDurationUnit).toObject()[cycleDurationUnit])
  let cycleNumber = Math.floor(unitsSinceStart/cycleDuration)

  // let daysSinceStart = Math.floor(today.diff(dateStartedObj, 'days').toObject().days)
  // let daysRemaining = daysSinceStart % cycleDuration

  // let cycleNumber = Math.floor(daysSinceStart/cycleDuration)
  let cycleStartDate = dateStartedObj.plus({[cycleDurationUnit]: cycleNumber*cycleDuration})
  let nextCycleStartDate = dateStartedObj.plus({[cycleDurationUnit]: (cycleNumber+1)*cycleDuration})
  let daysRemaining = Math.floor(nextCycleStartDate.diff(today, 'days').toObject().days)

  console.log(`util.getRotationCycleInfo: cycleNumber=${cycleNumber}, totalCycles=${totalCycles}, daysRemaining=${daysRemaining}`)


  return {cycleNumber, totalCycles, daysRemaining, cycleStartDate}
}

export const computeMembersPaid = function (rotation) {
  console.log(`util.computeMembersPaid`)
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

  let nonPayingThresh = rotation.members.length - (rotation.membersPerCycle*rotation.nonPayingCycles)
  let receivingPaymentThresh = rotation.membersPerCycle

  console.log(`util.computeMembersPaid: members.length=${rotation.members.length}, membersPerCycle=${rotation.membersPerCycle}, nonPayingCycles=${rotation.nonPayingCycles}`)
  console.log(`util.computeMembersPaid: nonPayingThresh=${nonPayingThresh}, receivingPaymentThresh=${receivingPaymentThresh}`)

  for (let idx=0; idx<rotation.members.length; idx++) {
    if (idx >= nonPayingThresh) {
      rotation.members[idx].nonPaying = true
    } else {
      rotation.members[idx].nonPaying = false
    }
    if (idx < receivingPaymentThresh) {
      rotation.members[idx].receivingPayment = true
    } else {
      rotation.members[idx].receivingPayment = false
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

export const getRotation = function (rotationId) {
  console.log(`util.getRotation: id=${rotationId}`)
  return authFetch(`/api/rotation/${rotationId}`, {
    method: 'GET'
  })
}

export const createRotation = function (options) {
  console.log(`util.createRotation`)
  return authFetch(`/api/rotation`, {
    method: 'POST',
    body: JSON.stringify(options),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const updateRotation = function (rotationId, options) {
  console.log(`util.updateRotation: ${rotationId}`)
  return authFetch(`/api/rotation/${rotationId}`, {
    method: 'PUT',
    body: JSON.stringify(options),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const deleteRotation = function (rotationId) {
  console.log(`util.deleteRotation: ${rotationId}`)
  return authFetch(`/api/rotation/${rotationId}`, {
    method: 'DELETE'
  })
}

export const getDefault = function (obj, key, defaultVal) {
  if (obj[key] === undefined) {
    return defaultVal
  } else {
    return obj[key]
  }
}

export const stringify = function (obj) {
  return JSON.stringify(obj, null, 2)
}
