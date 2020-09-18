import React, { useState } from "react"
import { faInfoCircle, faClock, faDollarSign, faUser } from '@fortawesome/free-solid-svg-icons'
import { authFetch } from "./../../util.js"

import InputField from './../InputField.js'

const AddMember = () => {

  const [displayManualAdd, setDisplayManualAdd] = useState(false)

  const onClick = function () {
    console.log('onClick')
  }


  return (
    <div className="box">
      <div className="field has-addons has-addons-centered">
        <div className="control">
          <InputField type="text" name="name" placeholder="Username" icon={faUser}></InputField>
        </div>
        <div className="control">
          <a className="button is-info" onClick={onClick}>
            Search
          </a>
        </div>
      </div>
    </div>
  )
}

const MemberDisplay = (props) => {
  const members = props.members

  return (
    <div className="table-container">
      <table className="table">
        <thead>
         <tr>
           <th><abbr title="Position">Pos</abbr></th>
           <th>Username</th>
           <th>Name</th>
         </tr>
        </thead>
        <tbody>
          {members.map((mem, idx) => (
            <tr key={mem.name}>
              <td>{idx + 1}</td>
              <td>{mem.username}</td>
              <td>{mem.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


const CreateRotation = (props) => {

  const durationUnits = ['Days', 'Weeks', 'Months']

  const [durationUnit, setDurationUnit] = useState(durationUnits[0])
  const [members, setMembers] = useState([
    {
      name: "First",
      username: 'first'
    }
  ])

  const onSelect = (evt) => {
    let val = evt.target.value
    setDurationUnit(val)
  }

  return (
    <div>
      <h4 className="title is-4">Create a new Rotation!</h4>
      <div className="columns">
        <div className="column is-one-third">
          <InputField type="text" name="name" label="Name"  icon={faInfoCircle}></InputField>
          <div className="field">
            <label className="label">Duration</label>
            <div className="field has-addons">
              <div className="control is-expanded">
                <InputField type="text" name="cycleDuration" icon={faClock}></InputField>
              </div>
              <div className="control">
                <span className="select" onChange={onSelect} value={durationUnit}>
                  <select>
                    {durationUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                </span>
              </div>
            </div>
          </div>
          <InputField type="text" name="cycleAmount" label="Cycle Payment" icon={faDollarSign}></InputField>
          <InputField type="number" name="nonPayingCycles" label="Nonpaying Cycles" icon={faInfoCircle}></InputField>
          <InputField type="number" name="membersPerCycle" label="Members per Cycle" icon={faUser}></InputField>
        </div>
        <div className="column is-two-thirds">
          <MemberDisplay members={members}/>
          <AddMember/>
        </div>
      </div>
    </div>
  )
}

export default CreateRotation
