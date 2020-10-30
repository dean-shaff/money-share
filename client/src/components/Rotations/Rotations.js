import React from "react"
import render from "react-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { Link, Route } from "react-router-dom";
import { DateTime } from 'luxon'

import NavbarLoggedIn from './../NavbarLoggedIn.js'
import User from "./../User.js"
import {
  stringify,
  getTokenUserInfo,
  getRotationCycleInfo,
  deleteNote,
  createNote,
  computeMembersPaid,
  authFetch
} from "./../../util.js"
import settings from './../../settings.js'

import ManagedRotation from './ManagedRotation/ManagedRotation.js'
import MemberRotation from './MemberRotation/MemberRotation.js'
import RotationsTable from './RotationsTable.js'

import './Rotations.css'

const DevTimeAdvancer = (props) => {

  const setDevDay = props.setDevDay

  return (
    <div className="container top-container">
      <div className="level">
        <div className="buttons has-addons">
          {/*<button className="button" onClick={() => {setDevDay(this.state.devDay - this.state.currentRotation.cycleDuration)}}>--</button>*/}
          <button className="button" onClick={() => {setDevDay(this.props.devDay - 1)}}>-</button>
          <button className="button" onClick={() => {setDevDay(0)}}>Reset</button>
          <button className="button" onClick={() => {setDevDay(this.props.devDay + 1)}}>+</button>
          {/*<button className="button" onClick={() => {setDevDay(this.state.devDay + this.state.currentRotation.cycleDuration)}}>++</button>*/}
        </div>
      </div>
    </div>
  )
}


class Rotations extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      username: null,
      userId: null,
      managedRotations: [],
      memberRotations: [],
      currentRotation: null,
      devDay: 0,
      today: null
    }
    this.onSelectRotationFactory = this.onSelectRotationFactory.bind(this)
    this.onManagedRotationAdd = this.onManagedRotationAdd.bind(this)
    this.onManagedRotationChange = this.onManagedRotationChange.bind(this)
    this.onManagedRotationDelete = this.onManagedRotationDelete.bind(this)
    this.onSetCurrentRotation = this.onSetCurrentRotation.bind(this)
    this.onChangeDevDay = this.onChangeDevDay.bind(this)
  }

  async componentDidMount() {
    console.log(`Rotations.componentDidMount: ${stringify(this.props.match)}`)
    const tokenUserInfo = getTokenUserInfo()
    this.setState({
      'username': tokenUserInfo.username,
      'userId': tokenUserInfo.id
    })
    let [managedRotations, memberRotations] = await Promise.all([
      authFetch(`/api/user/${tokenUserInfo.id}/managedRotations`).then(resp => resp.json()),
      authFetch(`/api/user/${tokenUserInfo.id}/memberRotations`).then(resp => resp.json())
    ])
    managedRotations = managedRotations.map(rot => {rot.managed = true; return computeMembersPaid(rot)})
    memberRotations = memberRotations
      .map(rot => {rot.managed = false; return computeMembersPaid(rot)})
      .filter(rot => rot.started)

    if (this.props.match.isExact) {
      let currentRotation = this.getCurrentRotation(managedRotations, memberRotations)
      console.log(currentRotation)
      this.setState({
        'managedRotations': managedRotations,
        'memberRotations': memberRotations,
        'currentRotation': currentRotation
      })
    } else {
      this.setState({
        'managedRotations': managedRotations,
        'memberRotations': memberRotations
      })
    }
  }

  getCurrentRotation (_managedRotations, _memberRotations) {
    const managedRotations = _managedRotations === undefined ? this.state.managedRotations: _managedRotations
    const memberRotations = _memberRotations === undefined ? this.state.memberRotations: _memberRotations
    console.log(`Rotations.getCurrentRotation: managedRotations=${stringify(managedRotations.map(mem => mem.name))}`)
    console.log(`Rotations.getCurrentRotation: memberRotations=${stringify(memberRotations.map(mem => mem.name))}`)

    if (managedRotations.length > 0) {
      return managedRotations[0]
    }
    if (memberRotations.length > 0) {
      return memberRotations[0]
    }
    return null
  }

  getPathToRotation (rotation) {
    let path = null
    if (rotation.managed) {
      if (rotation.started) {
        path = `${this.props.match.url}/managedRotation/${rotation.id}`
      } else {
        path = `${this.props.match.url}/managedRotation/${rotation.id}/update`
      }
    } else {
      path = `${this.props.match.url}/memberRotation/${rotation.id}`
    }
    return path
  }

  reDirectToCurrentRotation () {
    const currentRotation = this.state.currentRotation
    console.log(`Rotations.reDirect: currentRotation.name=${currentRotation.name}`)
    let path = null
    if (currentRotation === null) {
      path = `${this.props.match.url}/managedRotation/create`
    } else {
      path = this.getPathToRotation(currentRotation)
    }
    this.props.history.push(path)
  }

  reDirectToRotations () {
    this.props.history.push('/rotations')
  }

  onSelectRotationFactory (rotation) {
    return (evt) => {
      console.log(`onSelectRotationFactory`)
      let path = this.getPathToRotation(rotation)
      this.setState({
        'currentRotation': rotation
      }, () => {
        if (path !== null) {
          this.props.history.push(path)
        }
      })
    }
  }

  onSetCurrentRotation (rotation) {
    console.log('onSetCurrentRotation')
    this.setState({
      'currentRotation': rotation
    })
  }

  onChangeDevDay (evt) {
    const val = parseInt(evt.target.value)
    this.setDevDay(val)
  }

  setDevDay (day) {
    const today = DateTime.local().plus({'days': day})
    let managedRotations = this.state.managedRotations.map(rot => computeMembersPaid(rot, today))
    let memberRotations = this.state.memberRotations.map(rot => computeMembersPaid(rot, today))
    let currentRotation = computeMembersPaid(this.state.currentRotation, today)

    this.setState({
      'today': today,
      'devDay': day,
      'managedRotations': managedRotations,
      'memberRotations': memberRotations,
      'currentRotation': currentRotation
    })
  }

  onManagedRotationAdd (rotation) {
    console.log(`onManagedRotationAdd: ${rotation.id}, ${rotation.name}`)
    let managedRotations = this.state.managedRotations.slice()
    if (rotation.members === undefined) {
      rotation.members = []
    }
    rotation.managed = true
    managedRotations.unshift(rotation)
    this.setState({
      'managedRotations': managedRotations,
      'currentRotation': rotation
    }, () => {this.reDirectToCurrentRotation()})
  }

  onManagedRotationChange (rotation) {
    console.log(`onManagedRotationChange:  ${rotation.id}, ${rotation.name}`)
    let managedRotations = this.state.managedRotations.slice()
    let memberRotations = this.state.memberRotations.slice()
    rotation = computeMembersPaid(rotation)
    rotation.managed = true
    let idx = managedRotations.findIndex(rot => rot.id === rotation.id)
    // this means we've updated an existing rotation
    managedRotations[idx] = rotation
    let idxMember = memberRotations.findIndex(rot => rot.id === rotation.id)
    if (idxMember !== -1) {
      // means we need to update our member rotations as well!
      let rotationCopy = Object.assign({}, rotation)
      rotationCopy.managed = false
      memberRotations[idxMember] = rotationCopy
    } else {
      // it could be that we've added ourselves as a member, in which case we need to add to memberRotations list
      const user = getTokenUserInfo()
      let userIdx = rotation.members.findIndex(mem => mem.id === user.id)
      if (userIdx !== -1) {
        let rotationCopy = Object.assign({}, rotation)
        rotationCopy.managed = false
        memberRotations.unshift(rotationCopy)
      }
    }
    console.log(`onManagedRotationChange: rotation.managed=${rotation.managed}`)
    this.setState({
      'memberRotations': memberRotations,
      'managedRotations': managedRotations,
      'currentRotation': rotation
    })
  }

  onManagedRotationDelete (rotation) {
    console.log(`onManagedRotationDelete: deleting ${rotation.id}`)
    let managedRotations = this.state.managedRotations.slice()
    let memberRotations = this.state.memberRotations.slice()
    let idx = managedRotations.findIndex(rot => rot.id === rotation.id)
    if (idx !== -1) {
      managedRotations.splice(idx, 1)
      let idxMember = memberRotations.findIndex(rot => rot.id === rotation.id)
      if (idxMember !== -1) {
        memberRotations.splice(idxMember, 1)
      }
      this.setState({
        'memberRotations': memberRotations,
        'managedRotations': managedRotations
      }, () => {
        let currentRotation = this.getCurrentRotation()
        if (currentRotation !== null) {
          console.log(`onManagedRotationDelete: currentRotation.name=${currentRotation.name}`)
        } else {
          console.log(`onManagedRotationDelete: currentRotation is null`)
        }
        this.setState({
          'currentRotation': currentRotation
        }, () => {this.reDirectToRotations()})
      })
    }
  }

  render () {
    console.log(`Rotations.render: process.env.NODE_ENV=${process.env.NODE_ENV}`)
    return (
      <div>
      <NavbarLoggedIn/>
      {/*{process.env.NODE_ENV === 'development' ? <DevTimeAdvancer devDay={this.state.devDay} setDevDay={this.setDevDay}/> : null}*/}
      <div>
          <Route
            exact path={`${this.props.match.path}`}
            render={
              (props) => (
                <div className="container top-container">
                  <RotationsTable
                    userId={this.state.userId}
                    match={this.props.match}
                    managedRotations={this.state.managedRotations}
                    memberRotations={this.state.memberRotations}
                    onClickFactory={this.onSelectRotationFactory}
                    />
                </div>
              )
            }/>
          <Route
            path={`${this.props.match.path}/managedRotation/:rotationId`}
            render={
              (props) => (
                <ManagedRotation {...props}
                  rotations={this.state.managedRotations}
                  onSetCurrentRotation={this.onSetCurrentRotation}
                  onAdd={this.onManagedRotationAdd}
                  onChange={this.onManagedRotationChange}
                  onDelete={this.onManagedRotationDelete}/>)}/>
          <Route
            path={`${this.props.match.path}/memberRotation/:rotationId`}
            render={
              (props) => (
                <MemberRotation {...props}
                  rotations={this.state.memberRotations}
                  onSetCurrentRotation={this.onSetCurrentRotation}/>)}/>
      </div>
      </div>
    )
  }
}

export default Rotations
