import React from 'react'

import Dashboard from './Dashboard.js'
import { computeMembersPaid } from './../../../util.js'

const MemberRotation = (props) => {
  const rotationId = props.match.params.rotationId
  const rotation = props.rotations.find(rot => rot.id === rotationId)
  if (rotation !== undefined) {
    let {cycleNumber, totalCycles, daysRemaining, cycleStartDate} = computeMembersPaid(rotation)
    return <Dashboard rotation={rotation} daysRemaining={daysRemaining}/>
  } else {
    return null
  }
}

export default MemberRotation
