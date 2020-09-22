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
      'members': [],
      'cycleDuration': '',
      'cycleAmount': '',
      'nonPayingCycles': '',
      'membersPerCycle': '',
      'name': '',
      'errorMsg': ''
    }
    this.onSelect = this.onSelect.bind(this)
    this.onInputChange = this.onInputChange.bind(this)
    this.onSaveClick = this.onSaveClick.bind(this)
  }

  onSaveClick () {
    this.save()
  }

  async save(options) {
    if (options === undefined) {
      options = {}
    }
    // console.log(`CreateRotation.save: members.length=${this.state.members.length}`)
    const createUpdatePayload = Object.assign(options, {
      'memberIds': this.state.members.map(mem => mem.id),
      'cycleDuration': this.state.cycleDuration,
      'cycleDurationUnit': this.state.cycleDurationUnit.toLowerCase(),
      'cycleAmount': this.state.cycleAmount,
      'nonPayingCycles': this.state.nonPayingCycles,
      'membersPerCycle': this.state.membersPerCycle,
      'name': this.state.name
    })

    const userInfo = getTokenUserInfo()
    const createPayload = Object.assign({'managerId': userInfo.id}, createUpdatePayload)
    return createRotation(createPayload)
      .then(resp => {
        if (! resp.ok) {
          this.setState({errorMsg: 'Error when creating new Rotation'})
        } else {
          return resp.json()
        }
      })
      .then(data => this.props.onChange(data))
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
      <div>
        <div className="columns">
          <div className="column is-one-third is-offset-one-third ">
            <h4 className="title is-4">{titleText}</h4>
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
