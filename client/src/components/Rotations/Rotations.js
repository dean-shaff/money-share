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
// import { ManagedRotation } from './ManagedRotation/Man'
// import { MemberRotation } from './MemberRotation'

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

  let managedRotationElem = managedRotations.map(mapFactory(true))
  let memberRotationElem = memberRotations.map(mapFactory(false))

  return (
    <div>
      <label className="navbar-item"><strong>Managed Rotations</strong></label>
        {managedRotationElem}
      <label className="navbar-item"><strong>Member Rotations</strong></label>
        {memberRotationElem}
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
      // cycleNumber: null,
      // totalCycles: null,
      // daysRemaining: null,
      // cycleStartDate: null,
    }
    this.onLogoutHandler = this.onLogoutHandler.bind(this)
    // this.onStart = this.onStart.bind(this)
    // this.onUserPaidChange = this.onUserPaidChange.bind(this)
    this.onSelectRotationFactory = this.onSelectRotationFactory.bind(this)
    // this.onCreateNewRotation = this.onCreateNewRotation.bind(this)
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

    this.setState({
      'managedRotations': managedRotations,
      'memberRotations': memberRotations
    })

    if (this.props.match.isExact) {
      // only redirect if we're on /rotations
      if (managedRotations.length > 0) {
        this.setState({'currentRotation': managedRotations[0]})
        this.props.history.push(`${this.props.match.url}/managedRotation/${managedRotations[0].id}`)
        return
      }
      if (memberRotations > 0) {
        this.setState({'currentRotation': memberRotations[0]})
        this.props.history.push(`${this.props.match.url}/memberRotation/${memberRotations[0].id}`)
        return
      }
      this.props.history.push(`${this.props.match.url}/managedRotation/create`)
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

  onRotationChangeFactory (stateName) {
    return (rotation) => {
      console.log(`onRotationChangeFactory: ${stateName}`)
      let rotations = this.state[stateName].slice()
      for (let idx=0; idx<rotations.length; idx++) {
        if (rotations[idx].id === rotation.id) {
          rotations[idx] = rotation
          this.setState({
            [stateName]: rotations
          })
          return
        }
      }
      rotations.push(rotation)
      this.setState({
        [stateName]: rotations
      })
    }
  }

  render () {
    console.log(`Rotations.render`)
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
        <div className="navbar-menu">
          <div className="navbar-end">
            <div className="navbar-item has-dropdown is-hoverable on-top">
              <a className="navbar-link">{this.state.username}</a>
              <div className="navbar-dropdown is-right">
                {rotationDropDown}
                <hr className="navbar-divider"/>
                <Link className="navbar-item" to={`${this.props.match.url}/managedRotation/create`}>Create New Rotation</Link>
                <hr className="navbar-divider"/>
                <Link to="/" className="navbar-item" onClick={this.onLogoutHandler}>Logout</Link>
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
            render={(props) => <ManagedRotation {...props} rotations={this.state.managedRotations} onChange={this.onRotationChangeFactory('managedRotations')}/>}/>
          <Route
            path={`${this.props.match.path}/memberRotation/:rotationId`}
            render={(props) => <MemberRotation {...props} rotations={this.state.memberRotations} onChange={this.onRotationChangeFactory('memberRotations')}/>}/>
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
