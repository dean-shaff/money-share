import React, { useState } from "react"
import { faInfoCircle, faClock, faDollarSign, faUser } from '@fortawesome/free-solid-svg-icons'


import InputField from './../InputField.js'

const CreateRotation = () => {

  const durationUnits = ['Days', 'Weeks', 'Months']

  const [durationUnit, setDurationUnit] = useState(durationUnits[0])

  const onSelect = (evt) => {
    let val = evt.target.value
    setDurationUnit(val)
  }

  return (
    <div>
      <h4 className="title is-4">Create a new Rotation!</h4>
      <div className="columns">
        <div className="column is-one-third">
          <InputField type="text" name="name" placeholder="Name" icon={faInfoCircle}></InputField>
          <div className="field has-addons">
            <div className="control is-expanded">
              <InputField type="text" name="cycleDuration" placeholder="Duration" icon={faClock}></InputField>
            </div>
            <div className="control">
              <span className="select" onChange={onSelect} value={durationUnit}>
                <select>
                  {durationUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </span>
            </div>
          </div>
          <InputField type="text" name="cycleAmount" placeholder="Cycle Payment" icon={faDollarSign}></InputField>
          <InputField type="number" name="nonPayingCycles" placeholder="Nonpaying Cycles" icon={faInfoCircle}></InputField>
          <InputField type="number" name="membersPerCycle" placeholder="Members per Cycle" icon={faUser}></InputField>
        </div>
        <div className="column is-two-thirds">
        </div>
      </div>
    </div>
  )
}

export default CreateRotation
