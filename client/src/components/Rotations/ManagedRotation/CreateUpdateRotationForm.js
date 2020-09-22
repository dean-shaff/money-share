import React from 'react'
import { faInfoCircle, faClock, faDollarSign, faUser, faTimesCircle, faChevronDown, faChevronUp, faAt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


import InputField from './../../InputField.js'


class CreateUpdateRotationForm extends React.Component {

  render () {
    let startButton = null
    if (this.props.onStartClick !== undefined) {
      startButton = (
        <div className="control">
          <button className="button is-warning" onClick={this.props.onStartClick}>Start Rotation!</button>
        </div>
      )
    }

    return (
      <div>
        <InputField type="text" name="name" label="Name" value={this.props.name} onChange={this.props.onInputChange} icon={faInfoCircle}></InputField>
        <div className="field">
          <label className="label">Duration</label>
          <div className="field has-addons">
            <div className="control is-expanded">
              <InputField type="text" onChange={this.props.onInputChange} name="cycleDuration" value={this.props.cycleDuration} icon={faClock}></InputField>
            </div>
            <div className="control">
              <span className="select" onChange={this.props.onSelect} value={this.props.cycleDurationUnit}>
                <select>
                  {this.props.cycleDurationUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </span>
            </div>
          </div>
        </div>
        <InputField type="text" onChange={this.props.onInputChange} name="cycleAmount" value={this.props.cycleAmount} label="Cycle Payment" icon={faDollarSign}></InputField>
        <InputField type="number" onChange={this.props.onInputChange} name="nonPayingCycles" value={this.props.nonPayingCycles} label="Nonpaying Cycles" icon={faInfoCircle}></InputField>
        <InputField type="number" onChange={this.props.onInputChange} name="membersPerCycle" value={this.props.membersPerCycle} label="Members per Cycle" icon={faUser}></InputField>
        <div className="field is-grouped is-expanded">
          <div className="control">
            <button className="button is-primary" onClick={this.props.onSaveClick}>Save</button>
          </div>
          {startButton}
        </div>
        <div className='has-text-danger'>{this.props.errorMsg}</div>
      </div>
    )
  }
}


export default CreateUpdateRotationForm
