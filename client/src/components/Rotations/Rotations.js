import React from "react"
import render from "react-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import {
  Link,
  Switch,
  Route,
} from "react-router-dom";
import { DateTime } from 'luxon'

import AppTitle from "./../AppTitle.js"
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
    this.onLogoutHandler = this.onLogoutHandler.bind(this)
    this.onSelectRotationFactory = this.onSelectRotationFactory.bind(this)
    this.onRotationChangeFactory = this.onRotationChangeFactory.bind(this)
    this.onRotationDeleteFactory = this.onRotationDeleteFactory.bind(this)
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

  onLogoutHandler (evt) {
    localStorage.removeItem('token')
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

  onRotationDeleteFactory (stateName) {
    return (rotation) => {
      console.log(`onRotationDeleteFactory: ${stateName}: deleting ${rotation.id}`)
      let rotations = this.state[stateName].slice()
      let idx = rotations.findIndex(rot => rot.id === rotation.id)
      if (idx !== -1) {
        rotations.splice(idx, 1)
        this.setState({
          [stateName]: rotations
        }, () => {
          let currentRotation = this.getCurrentRotation()
          console.log(`onRotationDeleteFactory: currentRotation.name=${currentRotation.name}`)
          this.setState({
            'currentRotation': currentRotation
          }, () => {this.reDirectToRotations()})
        })
      }
    }
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


  onRotationChangeFactory (stateName) {
    return (rotation) => {
      console.log(`onRotationChangeFactory: ${stateName}: ${rotation.id}, ${rotation.name}`)
      let rotations = this.state[stateName].slice()
      let idx = rotations.findIndex(rot => rot.id === rotation.id)
      rotation = computeMembersPaid(rotation)
      if (idx === -1) {
        console.log(`onRotationChangeFactory: adding rotation`)
        // this means we've added a new rotation
        if (rotation.members === undefined) {
          rotation.members = []
        }
        rotation.managed = true
        rotations.unshift(rotation)
        this.setState({
          [stateName]: rotations,
          'currentRotation': rotation
        }, () => {this.reDirectToCurrentRotation()})
      } else {
        console.log(`onRotationChangeFactory: updating rotation`)
        // this means we've updated an existing rotation
        rotations[idx] = rotation
        this.setState({
          [stateName]: rotations,
          'currentRotation': rotation
        })
      }
    }
  }

  render () {

    return (
      <div>
      <nav className="navbar is-spaced has-shadow" role="navigation" aria-label="main navigation">
        <div className="container">
          <div className="navbar-brand">
            <a href="/" className="navbar-item">
              <AppTitle/>
            </a>
          </div>
        </div>
        <div className="navbar-menu is-active">
          <div className="navbar-end">
            <div className="navbar-item has-dropdown is-hoverable">
              <a className="navbar-link">{this.state.username}</a>
              <div className="navbar-dropdown is-right on-top">
                <Link className="navbar-item" to={`${this.props.match.url}/managedRotation/create`}>Create New Rotation</Link>
                <hr className="navbar-divider"/>
                <Link to="/" className="navbar-item" onClick={this.onLogoutHandler}>Logout</Link>
                <hr className="navbar-divider"/>
                <Link to="/changePassword" className="navbar-item">Change Password</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="container">
        <div className="level">
          <div className="level-item">
            <input className="slider is-fullwidth has-output" onChange={this.onChangeDevDay} step="1" min="0" max="400" value={this.state.devDay} type="range"/>
            <output>{this.state.devDay}</output>
          </div>
          <div className="level-item">
            <button className="button" onClick={() => {this.setDevDay(0)}}>Reset</button>
          </div>
        </div>
      </div>
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
                  onChange={this.onRotationChangeFactory('managedRotations')}
                  onDelete={this.onRotationDeleteFactory('managedRotations')}/>)}/>
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
