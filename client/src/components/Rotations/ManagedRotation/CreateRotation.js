import React, { useState } from "react"
import qs from 'qs'
import { faInfoCircle, faClock, faDollarSign, faUser, faTimesCircle, faChevronDown, faChevronUp, faAt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DateTime } from 'luxon'

import InputField from './../../InputField.js'
import CreateUpdateRotationForm from "./CreateUpdateRotationForm"
import { authFetch, getDefault, getTokenUserInfo, createRotation, updateRotation } from "./../../../util.js"

import "./../../User.css"


class CreateRotation extends React.Component {
  constructor(props) {
    super(props)
    const cycleDurationUnits = ['days', 'weeks', 'months']
    this.state = {
      'cycleDurationUnits': cycleDurationUnits,
      'cycleDurationUnit': cycleDurationUnits[0],
      'cycleDuration': '28',
      'cycleAmount': '100',
      'nonPayingCycles': 0,
      'membersPerCycle': 1,
      'name': 'Rotation 1',
      'errorMsg': ''
    }
    this.onSelect = this.onSelect.bind(this)
    this.onInputChange = this.onInputChange.bind(this)
    this.onSaveClick = this.onSaveClick.bind(this)
  }

  onSaveClick () {
    if (this.state.name === '') {
      this.setState({
        [errorMsg]: 'Please make sure your rotation has a name before saving!'
      })
      return
    }
    this.save()
  }

  async save() {
    const createUpdatePayload = {
      'cycleDuration': this.state.cycleDuration,
      'cycleDurationUnit': this.state.cycleDurationUnit.toLowerCase(),
      'cycleAmount': this.state.cycleAmount,
      'nonPayingCycles': this.state.nonPayingCycles,
      'membersPerCycle': this.state.membersPerCycle,
      'name': this.state.name
    }

    const userInfo = getTokenUserInfo()
    const createPayload = Object.assign({'managerId': userInfo.id}, createUpdatePayload)
    return createRotation(createPayload)
      .then(resp => resp.json())
      .then(data => this.props.onChange(data))
      .catch(err => {
        let msg = err.message
        if (err.message === '400') {
          msg = 'A rotation with this name already exists!'
        }
        this.setState({
          'errorMsg': msg
        })
      })
  }

  onSelect (evt) {
    let val = evt.target.value
    this.setState({
      'cycleDurationUnit': val
    })
  }

  onInputChange (evt) {
    let name = evt.target.name
    this.setState({
      [name]: evt.target.value
    })
  }

  render () {

    let titleText = `Create a new Rotation!`

    return (
      <div className="container top-container">
        <div className="columns">
          <div className="column is-half is-offset-one-quarter ">
            <div className="title">{titleText}</div>
            <CreateUpdateRotationForm
              cycleDurationUnits={this.state.cycleDurationUnits}
              cycleDuration={this.state.cycleDuration}
              cycleAmount={this.state.cycleAmount}
              nonPayingCycles={this.state.nonPayingCycles}
              membersPerCycle={this.state.membersPerCycle}
              name={this.state.name}
              errorMsg={this.state.errorMsg}
              onInputChange={this.onInputChange}
              onSaveClick={this.onSaveClick}
              onSelect={this.onSelect}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default CreateRotation
