import jwtDecode from 'jwt-decode'

import { DateTime } from 'luxon'


/**
 * Given some user data, clean it up. Throw an error if there is something wrong
 * @param  {[type]} user [description]
 * @return {[type]}      [description]
 */
export const checkUser = function (user) {
  if (user.phone !== '' && user.phone != null) {
    if (cleanPhone(user.phone).length !== 10) {
      throw new Error("Please provide 10 digit phone number")
    }
  }

  if (user.email === '' || ! user.email.includes('@')) {
    throw new Error("Please provide a valid email address")
  }

  if (user.username === '') {
    throw new Error("Username cannot be empty")
  }

  if (user.password !== undefined) {
    if (user.password === '') {
      throw new Error("Password cannot be empty")
    }
  }
}


export const cleanPhone = function (str) {
  return str.replace(/-| |\(|\)/g, '')
}

export const capitalize = function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

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

export const authFetch = async function (url, options, err) {
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
  if (err == null) {
    err = handleErrors
  }

  console.log(`authFetch: options=${JSON.stringify(options, null, 2)}`)
  return fetch(url, options).then(err)
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
    // arr.unshift(arr.pop());
    arr.push(arr.shift())
  }
}


/**
 * Get the current cycle number, the total number of cycles in the rotation,
 * the number of days remaining in the cycle, and this cycle's start date
 * @param  {[type]} rotation rotation object.
 * @param  {[type]} todayFunction function to generate today. Defaults to moment constructor
 * @return {[type]}          [description]
 */
export const getRotationCycleInfo = function (rotation, today) {
  if (today == null) {
    today = DateTime.local()
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

  const dateStartedObj = DateTime.fromISO(dateStarted)

  let timeSinceStart = dateStartedObj
  let absoluteCycleNumber = 0

  console.log(`util.getRotationCycleInfo: today=${today.toISO()}`)
  while (true) {
    console.log(`util.getRotationCycleInfo: timeSinceStart=${timeSinceStart.toISO()}`)
    timeSinceStart = timeSinceStart.plus({[cycleDurationUnit]: cycleDuration})
    if (timeSinceStart >= today) {
      console.log(`util.getRotationCycleInfo: exiting loop: timeSinceStart=${timeSinceStart.toISO()}`)
      break
    }
    timeSinceStart = timeSinceStart.plus({'days': 1})
    absoluteCycleNumber++
  }
  // let unitsSinceStart = Math.floor(today.diff(dateStartedObj, cycleDurationUnit).toObject()[cycleDurationUnit])
  // console.log(`util.getRotationCycleInfo: ${Math.floor(unitsSinceStart/cycleDuration)}, ${absoluteCycleNumber}`)
  // let absoluteCycleNumber = Math.floor(unitsSinceStart/cycleDuration)
  let cycleNumber = absoluteCycleNumber % totalCycles

  let cycleStartDate = dateStartedObj.plus({[cycleDurationUnit]: absoluteCycleNumber*cycleDuration}).plus({'days': absoluteCycleNumber})
  let cycleEndDate = cycleStartDate.plus({[cycleDurationUnit]: cycleDuration})
  let nextCycleStartDate = cycleStartDate.plus({[cycleDurationUnit]: cycleDuration}).plus({'days': 1})

  let daysRemaining = Math.floor(cycleEndDate.diff(today, 'days').toObject().days)

  console.log(`util.getRotationCycleInfo: cycleStartDate=${cycleStartDate.toISO()}, cycleEndDate=${cycleEndDate.toISO()}, nextCycleStartDate=${nextCycleStartDate.toISO()}`)
  console.log(`util.getRotationCycleInfo: cycleNumber=${cycleNumber}, totalCycles=${totalCycles}, daysRemaining=${daysRemaining}`)

  return {
    absoluteCycleNumber,
    cycleNumber,
    totalCycles,
    daysRemaining,
    cycleStartDate,
    cycleEndDate,
    nextCycleStartDate,
    today
  }
}

export const computeMembersPaid = function (rotation, _today) {
  console.log(`util.computeMembersPaid`)
  if (! rotation.started) {
    return rotation
  }
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
  let {cycleNumber, totalCycles, daysRemaining, cycleStartDate, cycleEndDate, nextCycleStartDate, today} = getRotationCycleInfo(rotation, _today)
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

    let notes = rotation.members[idx].CycleNotes.filter(note => note.rotationId === rotation.id)
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

  rotation.cycleNumber = cycleNumber
  rotation.totalCycles = totalCycles
  rotation.daysRemaining = daysRemaining
  rotation.cycleStartDate = cycleStartDate
  rotation.cycleEndDate = cycleEndDate
  rotation.nextCycleStartDate = nextCycleStartDate
  rotation.today = today

  return rotation
}

export const computeTotalMembersPaid = function (rotation) {
  let paidLen = rotation.members.filter(mem => mem.paid && ! mem.nonPaying).length
  let payingLen = rotation.members.length - (rotation.membersPerCycle * rotation.nonPayingCycles)
  return { paidLen, payingLen }
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
