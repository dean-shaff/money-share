import React from "react"

const Configuration = (props) => {
  const rotation = props.rotation
  const totalCycles = props.totalCycles
  const nonPayingMembers = rotation.nonPayingCycles * rotation.membersPerCycle

  return (
    <div className="content is-large">
      <p className="title">Rotation Name: <span className="has-text-primary">{rotation.name}</span></p>
      <p className="title">Cycle Duration: <span className="has-text-primary">{rotation.cycleDuration}</span></p>
      <p className="title">Cycle Amount: <span className="has-text-primary">${rotation.cycleAmount}</span></p>
      <p className="title">Nonpaying Members per cycle: <span className="has-text-primary">{nonPayingMembers}</span></p>
      <p className="title">Number of Cycles per Rotation: <span className="has-text-primary">{totalCycles}</span></p>
    </div>
  )
}

export default Configuration
