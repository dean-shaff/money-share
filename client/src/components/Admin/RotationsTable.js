import React from 'react'
import { DateTime } from 'luxon'

import settings from './../../settings.js'
import AdminTable from './AdminTable.js'

const dateFormat = settings.dateFormat


const rotationRow = (rot) => {
  const membersLen = rot.members.length
  let dateStartedText = "-"
  if (rot.started) {
    dateStartedText = DateTime.fromISO(rot.dateStarted).toFormat(dateFormat)
  }

  let { cycleAmount, cycleDuration, cycleDurationUnit, ...rest } = rot

  if (cycleDuration === 1) {
    cycleDurationUnit = cycleDurationUnit.slice(0, cycleDurationUnit.length - 1)
  }

  return [
    rot.name,
    membersLen,
    dateStartedText,
    `$${cycleAmount}`,
    `${cycleDuration} ${cycleDurationUnit}`
  ]
}


const labels = [
  "Name",
  "Number of Users",
  "Date Started",
  "Cycle Payment Amount",
  "Cycle Duration"
]


const RotationsTable = (props) => {
  const Component = props.component
  return (
    <Component
      title={props.title}
      getRow={rotationRow}
      labels={labels}
      data={props.rotations}
      subDomain="rotation"/>
  )
}

export default RotationsTable
