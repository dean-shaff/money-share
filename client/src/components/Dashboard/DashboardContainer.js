import React from "react"
import render from "react-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import {
  useLocation,
  BrowserRouter as Router,
  Link,
  Switch,
  Route,
} from "react-router-dom";
import { DateTime } from 'luxon'

import User from "./../User.js"
import Dashboard from "./Dashboard.js"
import Configuration from "./Configuration.js"
import { getTokenUserInfo, getRotationCycleInfo, deleteNote, createNote, roll } from "./../../util.js"
import settings from './../../settings.js'

import './DashboardContainer.css'


const dateFormat = settings.dateFormat


const getLiClassNameFactory = (highlightPathName) => {
  return (pathName) => {
    if (highlightPathName === pathName) {
      return 'is-active'
    } else {
      return ''
    }
  }
}

// <li className={getLiClassName("/members")}><Link to="/members">Members</Link></li>
// <li className={getLiClassName("/queue")}><Link to="/queue">Queue</Link></li>

const HighlightedTab = ({ children }) => {
  const location = useLocation()
  const getLiClassName = getLiClassNameFactory(location.pathname)
  return (
    <div className="container">
      <div className="tabs">
        <ul>
          <li className={getLiClassName("/dashboard")}><Link to="/dashboard">Dashboard</Link></li>
          <li className={getLiClassName("/configuration")}><Link to="/configuration">Configuration</Link></li>
        </ul>
      </div>
      {children}
    </div>
  )
}


//
// const Members = () => {
//   return <div>Hello from Members</div>
// }
//
// const Queue = () => {
//   return <div>Hello from Queue</div>
// }
// <Route path="/members">
//   <HighlightedTab>
//     <Members/>
//   </HighlightedTab>
// </Route>
// <Route path="/queue">
//   <HighlightedTab>
//     <Queue/>
//   </HighlightedTab>
// </Route>
//



class DashboardContainer extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      username: null,
      rotations: null,
      currentRotation: null,
      rotationNames: null,
      currentRotationName: null,
      cycleNumber: null,
      totalCycles: null,
      daysRemaining: null,
      cycleStartDate: null,
    }
    this.onLogoutHandler = this.onLogoutHandler.bind(this)
    this.onPlusCircleClick = this.onPlusCircleClick.bind(this)
    this.onStart = this.onStart.bind(this)
    this.onUserPaidChange = this.onUserPaidChange.bind(this)
  }

  componentDidMount() {
    const tokenUserInfo = getTokenUserInfo()
    this.setState({
      'username': tokenUserInfo.username
    })
    fetch(`/api/user/${tokenUserInfo.id}/rotations`)
      .then(resp => resp.json())
      .then(data => {

        let {rotation, cycleNumber, totalCycles, daysRemaining, cycleStartDate} = this.computeMembersPaid(data[0])

        this.setState({
          'rotations': data,
          'currentRotation': rotation,
          'currentRotationName': rotation.name,
          'cycleNumber': cycleNumber,
          'totalCycles': totalCycles,
          'daysRemaining': daysRemaining,
          'cycleStartDate': cycleStartDate,
          'rotationNames': data.map(d => d.name)
        })

        // let memberIds = data[0].members.map(member => member.id)
        // return this.setCurrentRotationUsers(memberIds)
      })
  }

  // setCurrentRotationUsers (memberIds) {
  //   return fetch(`/api/users`, {
  //     method: 'POST',
  //     body: JSON.stringify({ids: memberIds}),
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //   })
  //   .then(resp => resp.json())
  //   .then(data => {
  //     this.setState({
  //       'currentRotationMembers': data.users
  //     })
  //   })
  // }

  onUserPaidChange (evt, user, paid) {
    console.log(`onUserPaidChange`)
    const rotationId = this.state.currentRotation.id
    const userId = user.id
    if (! paid) {
      console.log(`DashboardContainer.onUserPaidChange: deleting newest note`)
      let notes = user.CycleNotes
      let mostRecent = notes[notes.length - 1]
      deleteNote(userId, mostRecent.id)
        .then(resp => {
          if (resp.status === 204) {
            let currentRotation = JSON.parse(JSON.stringify(this.state.currentRotation))
            for (let idx=0; idx<currentRotation.members.length; idx++) {
              if (currentRotation.members[idx].id === userId) {
                currentRotation.members[idx].paid = false
                currentRotation.members[idx].CycleNotes.pop()
                break
              }
            }
            this.setState({'currentRotation': currentRotation})
          }
        })
    } else {
      console.log(`DashboardContainer.onUserPaidChange: creating new note`)
      const datePaid = DateTime.local().toISO()
      const amountPaid = this.state.currentRotation.cycleAmount
      // userId, rotationId, datePaid, amountPaid
      createNote(userId, rotationId, datePaid, amountPaid)
        .then(resp => resp.json())
        .then(data => {
          let currentRotation = JSON.parse(JSON.stringify(this.state.currentRotation))
          for (let idx=0; idx<currentRotation.members.length; idx++) {
            if (currentRotation.members[idx].id == userId) {
              currentRotation.members[idx].paid = true
              currentRotation.members[idx].CycleNotes.push(data)
              break
            }
          }
          this.setState({'currentRotation': currentRotation})
        })
    }
  }

  computeMembersPaid (rotation) {
    if (! rotation.started) {
      return {}
    }

    const dateCompare = (a, b) => {
      let dateA = DateTime.fromISO(a.datePaid)
      let dateB = DateTime.fromISO(b.datePaid)
      if (dateA > dateB) {
        return 1
      } else if (dateA.toMillis() === dateB.toMillis()) {
        return 0
      } else {
        return -1
      }
    }

    const rotationIndexCompare = (a, b) => {
      let idxA = a.MemberRotation.rotationIndex
      let idxB = b.MemberRotation.rotationIndex
      if (idxA > idxB) {
        return 1
      } else if (idxA === idxB) {
        return 0
      } else {
        return -1
      }
    }

    let dateStarted = DateTime.fromISO(rotation.dateStarted)
    let {cycleNumber, totalCycles, daysRemaining, cycleStartDate} = getRotationCycleInfo(rotation)
    rotation.members.sort(rotationIndexCompare)
    roll(rotation.members, cycleNumber*rotation.membersPerCycle)

    let notPayingThresh = rotation.members.length - rotation.membersPerCycle*rotation.nonPayingCycles

    for (let idx=0; idx<rotation.members.length; idx++) {
      if (idx >= notPayingThresh) {
        rotation.members[idx].nonPaying = true
      } else {
        rotation.members[idx].nonPaying = false
      }

      let notes = rotation.members[idx].CycleNotes
      rotation.members[idx].paid = false

      if (notes.length > 0) {
        notes.sort(dateCompare)
        let mostRecent = notes[notes.length - 1]
        let mostRecentPaid = DateTime.fromISO(mostRecent.datePaid)
        if (mostRecentPaid >= cycleStartDate) {
          rotation.members[idx].paid = true
        }
        rotation.members[idx].CycleNotes = notes
      }
    }

    return {rotation, cycleNumber, totalCycles, daysRemaining, cycleStartDate}
  }

  onLogoutHandler (evt) {
    localStorage.removeItem('token')
    this.props.history.push('/')
  }

  onPlusCircleClick (evt) {
    console.log('click')
  }

  onStart (evt) {
    const rotationId = this.state.currentRotation.id
    console.log(`DashboardContainer.onStart: ${rotationId}`)
    fetch(`/api/rotation/${rotationId}`, {
      method: 'PUT',
      body: JSON.stringify({
        'started': true,
        'dateStarted': new Date()
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(resp => resp.json())
    .then(data => {
      console.log(data)
      this.setCurrentRotationUsers(data.members.map(member => member.id))
    })
  }

  render () {
    let rotationDropDown = null
    if (this.state.rotationNames !== null) {
      rotationDropDown = this.state.rotationNames.map((name, idx) => {
        if (name !== this.state.currentRotationName) {
          return (<div className="navbar-dropdown" key={idx}>
            <a className="navbar-item">{name}</a>
          </div>)
        }
      })
    }
    let dashboard = null

    if (this.state.currentRotation !== null) {
      if (this.state.currentRotation.started === null || ! this.state.currentRotation.started) {
        dashboard = (
          <div>
            <button className="button is-primary" onClick={this.onStart}>Start Rotation!</button>
          </div>
        )
      } else {
        dashboard = (
          <Dashboard
            tilesPerRow={4}
            onUserPaidChange={this.onUserPaidChange}
            daysRemaining={this.state.daysRemaining}
            cycleNumber={this.state.cycleNumber}
            totalCycles={this.state.totalCycles}
            cycleStartDate={this.state.cycleStartDate}
            rotation={this.state.currentRotation}/>
        )
      }
    }
    // let DashboardTab = <HighlightedTab component={Dashboard} path="/dashboard"/>
    return (
    <Router>
      <div>
      <nav className="navbar is-spaced has-shadow" role="navigation" aria-label="main navigation">
        <div className="container">
          <div className="navbar-brand">
            <a href="/" className="navbar-item">
              <h1 className="title is-1">Money Share App</h1>
            </a>
          </div>
        </div>
        <div className="navbar-menu">
          <div className="navbar-end">
            <div className="navbar-item">
            <span className="icon is-small is-left" onClick={this.onPlusCircleClick}>
              <FontAwesomeIcon icon={faPlusCircle} />
            </span>
            </div>
            <div className="navbar-item has-dropdown is-hoverable">
              <a className="navbar-link">{this.state.username}</a>
              <div className="navbar-dropdown">
                <a className="navbar-item" onClick={this.onLogoutHandler}>Logout</a>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <section className="section top-section">
        <div className="container">
          <nav className="navbar">
            <div className="navbar-menu">
              <div className="navbar-start">
                <div className="navbar-item has-dropdown is-hoverable">
                  <a className="navbar-link">{this.state.currentRotationName}</a>
                  {rotationDropDown}
                </div>
              </div>
            </div>
          </nav>
          <Switch>
            <Route path="/dashboard" >
              <HighlightedTab>
                {dashboard}
              </HighlightedTab>
            </Route>
            <Route path="/configuration">
              <HighlightedTab>
                <Configuration/>
              </HighlightedTab>
            </Route>
          </Switch>
        </div>
      </section>
      </div>
    </Router>
    )
  }
}



export default DashboardContainer
