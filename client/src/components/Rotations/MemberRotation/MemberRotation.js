import React from 'react'

import Dashboard from './Dashboard.js'
import RotationsNavigation from './../RotationsNavigation.js'

const MemberRotation = (props) => {
  const rotationId = props.match.params.rotationId
  const rotation = props.rotations.find(rot => rot.id === rotationId)
  if (rotation !== undefined) {
    return (
      <RotationsNavigation rotation={rotation} rotations={props.rotations}>
        <Dashboard rotation={rotation} onSetCurrentRotation={props.onSetCurrentRotation}/>
      </RotationsNavigation>
    )
  } else {
    return null
  }
}

export default MemberRotation
