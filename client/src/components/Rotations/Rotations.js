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
  roll,
  computeMembersPaid,
  authFetch
} from "./../../util.js"
import settings from './../../settings.js'

import ManagedRotation from './ManagedRotation/ManagedRotation.js'
import MemberRotation from './MemberRotation/MemberRotation.js'

import './Rotations.css'


const dateFormat = settings.dateFormat


const RotationDropDown = ({match, managedRotations, memberRotations, currentRotation, onClickFactory}) => {

  const mapFactory = (flag) => {
    return (rot, idx) => {
      const name = rot.name
      let className = 'navbar-item'
      if (currentRotation !== null) {
        let managed = flag ? currentRotation.managed: ! currentRotation.managed
        if (name === currentRotation.name && managed) {
          className = `${className} is-active`
        }
      }
      const onClick = onClickFactory(rot)

      if (rot.managed) {
        if (rot.started) {
          return <Link className={className} key={rot.id} to={`${match.url}/managedRotation/${rot.id}`} onClick={onClick}>{name}</Link>
        } else {
          return <Link className={className} key={rot.id} to={`${match.url}/managedRotation/${rot.id}/update`} onClick={onClick}>{name}</Link>
        }
      } else {
        if (rot.started) {
          return <Link className={className} key={rot.id} to={`${match.url}/memberRotation/${rot.id}`} onClick={onClick}>{name}</Link>
        } else {
          return null
        }
      }
    }
  }

  let managed = null
  if (managedRotations.length > 0) {
    managed = (
      <>
        <label className="navbar-item"><strong>Managed Rotations</strong></label>
        {managedRotations.map(mapFactory(true))}
      </>
    )
  }
  let member = null
  if (memberRotations.length > 0) {
    member = (
      <>
        <label className="navbar-item"><strong>Member Rotations</strong></label>
        {memberRotations.map(mapFactory(false))}
      </>
    )
  }

  return (
    <div>
      {managed}
      {member}
    </div>
  )
}


class Rotations extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      username: null,
      managedRotations: [],
      memberRotations: [],
      currentRotation: null
    }
    this.onLogoutHandler = this.onLogoutHandler.bind(this)
    this.onSelectRotationFactory = this.onSelectRotationFactory.bind(this)
    this.onRotationChangeFactory = this.onRotationChangeFactory.bind(this)
    this.onRotationDeleteFactory = this.onRotationDeleteFactory.bind(this)
    this.onSetCurrentRotation = this.onSetCurrentRotation.bind(this)
  }

  async componentDidMount() {
    console.log(`Rotations.componentDidMount: ${stringify(this.props.match)}`)
    const tokenUserInfo = getTokenUserInfo()
    this.setState({
      'username': tokenUserInfo.username
    })
    let [managedRotations, memberRotations] = await Promise.all([
      authFetch(`/api/user/${tokenUserInfo.id}/managedRotations`).then(resp => resp.json()),
      authFetch(`/api/user/${tokenUserInfo.id}/memberRotations`).then(resp => resp.json())
    ])
    managedRotations = managedRotations.map(rot => {rot.managed = true; return rot})
    memberRotations = memberRotations.map(rot => {rot.managed = false; return rot})
    if (this.props.match.isExact) {
      let currentRotation = this.getCurrentRotation(managedRotations, memberRotations)
      console.log(currentRotation)
      this.setState({
        'managedRotations': managedRotations,
        'memberRotations': memberRotations,
        'currentRotation': currentRotation
      }, () => {this.reDirect()})
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

  reDirect () {
    const currentRotation = this.state.currentRotation
    console.log(`Rotations.reDirect: currentRotation.name=${currentRotation.name}`)
    if (currentRotation === null) {
      this.props.history.push(`${this.props.match.url}/managedRotation/create`)
      return
    }
    if (currentRotation.managed) {
      this.props.history.push(`${this.props.match.url}/managedRotation/${currentRotation.id}`)
    } else {
      this.props.history.push(`${this.props.match.url}/memberRotation/${currentRotation.id}`)
    }
  }

  onLogoutHandler (evt) {
    localStorage.removeItem('token')
  }

  onSelectRotationFactory (rotation) {
    return (evt) => {
      console.log(`onSelectRotationFactory`)
      this.setState({
        'currentRotation': rotation
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
          }, () => {this.reDirect()})
        })
      }
    }
  }

  onRotationChangeFactory (stateName) {
    return (rotation) => {
      console.log(`onRotationChangeFactory: ${stateName}: ${rotation.id}, ${rotation.name}`)
      let rotations = this.state[stateName].slice()
      let idx = rotations.findIndex(rot => rot.id === rotation.id)
      if (idx === -1) {
        // this means we've added a new rotation
        if (rotation.members === undefined) {
          rotation.members = []
        }
        rotation.managed = true
        rotations.unshift(rotation)
        this.setState({
          [stateName]: rotations,
          'currentRotation': rotation
        }, () => {this.reDirect()})
      } else {
        // this means we've updated an existing rotation
        rotations[idx] = rotation
        this.setState({
          [stateName]: rotations,
          'currentRotation': rotation
        }) //, () => {this.props.history.push(`${this.props.match.url}/managedRotation/${rotation.id}/dashboard`)})
      }
    }
  }

  render () {
    let rotationDropDown = null
    if (this.state.managedRotations.length > 0 || this.state.memberRotations.length > 0) {
      rotationDropDown = (
        <RotationDropDown
          match={this.props.match}
          managedRotations={this.state.managedRotations}
          memberRotations={this.state.memberRotations}
          currentRotation={this.state.currentRotation}
          onClickFactory={this.onSelectRotationFactory}
          />
        )
    }

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
            <div className="navbar-item has-dropdown is-hoverable on-top">
              <a className="navbar-link">{this.state.username}</a>
              <div className="navbar-dropdown is-right">
                {rotationDropDown}
                <hr className="navbar-divider"/>
                <Link className="navbar-item" to={`${this.props.match.url}/managedRotation/create`}>Create New Rotation</Link>
                <hr className="navbar-divider"/>
                <Link to="/" className="navbar-item" onClick={this.onLogoutHandler}>Logout</Link>
                <hr className="navbar-divider"/>
                <Link to="/changePassword" className="navbar-item">Change Password</Link>
                {/*<a className="navbar-item" onClick={this.onLogoutHandler}>Logout</a>*/}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <section className="section top-section">
        <div className="container">
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
      </section>
      </div>
    )
  }
}



export default Rotations

// const Rotations = ({ match }) => {
//   return (
//     <div>
//
//
//       <Route path={`${match.path}/memberRotation/:rotationId/dashboard`} component={ManagedRotationDashboard}/>
//       <Route path={`${match.path}/memberRotation/:rotationId/configuration`} component={ManagedRotationConfiguration}/>
//     </div>
//   )
// }
//
// export default Rotations
