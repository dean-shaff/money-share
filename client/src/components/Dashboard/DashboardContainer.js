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

import AppTitle from "./../AppTitle.js"
import User from "./../User.js"
import Dashboard from "./Dashboard.js"
import Configuration from "./Configuration.js"
import CreateRotation from "./CreateRotation.js"
import { getTokenUserInfo, getRotationCycleInfo, deleteNote, createNote, roll, computeMembersPaid } from "./../../util.js"
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

const HighlightedTab = ({ children }) => {
  const location = useLocation()
  const getLiClassName = getLiClassNameFactory(location.pathname)
  return (
    <div className="container">
      <div className="tabs is-medium is-boxed">
        <ul>
          <li className={getLiClassName("/dashboard")}><Link to="/dashboard">Dashboard</Link></li>
          <li className={getLiClassName("/configuration")}><Link to="/configuration">Configuration</Link></li>
        </ul>
      </div>
      {children}
    </div>
  )
}

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
    this.onSelectRotationFactory = this.onSelectRotationFactory.bind(this)
  }

  componentDidMount() {
    const tokenUserInfo = getTokenUserInfo()
    this.setState({
      'username': tokenUserInfo.username
    })
    fetch(`/api/user/${tokenUserInfo.id}/managedRotations`)
      .then(resp => resp.json())
      .then(data => {
        console.log(`componentDidMount: data=${JSON.stringify(data, null, 2)}`)
        if (data.length > 0) {
          this.setState({
            'rotations': data,
            'rotationNames': data.map(d => d.name)
          })
          this.setRotation(data[0])
        } else {
          this.props.history.push('/createRotation')
        }
      })
  }

  setRotation(newRotation) {
    let {rotation, cycleNumber, totalCycles, daysRemaining, cycleStartDate} = computeMembersPaid(newRotation)
    this.setState({
      'currentRotation': rotation,
      'currentRotationName': rotation.name,
      'cycleNumber': cycleNumber,
      'totalCycles': totalCycles,
      'daysRemaining': daysRemaining,
      'cycleStartDate': cycleStartDate
    })
  }

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



  onLogoutHandler (evt) {
    localStorage.removeItem('token')
    this.props.history.push('/')
  }

  onSelectRotationFactory (idx) {
    return (evt) => {
      if (this.state.currentRotation.id !== this.state.rotations[idx].id) {
        this.setRotation(this.state.rotations[idx])
      }
    }
  }

  onPlusCircleClick (evt) {
    console.log('click')
  }

  onStart (evt) {
    const rotationId = this.state.currentRotation.id
    console.log(`DashboardContainer.onStart: ${rotationId}`)
    // fetch(`/api/rotation/${rotationId}`, {
    //   method: 'PUT',
    //   body: JSON.stringify({
    //     'started': true,
    //     'dateStarted': DateTime.local()
    //   }),
    //   headers: {
    //     'Content-Type': 'application/json'
    //   }
    // })
    // .then(resp => resp.json())
    // .then(data => {
    //   console.log(data)
    //   this.setCurrentRotationUsers(data.members.map(member => member.id))
    // })
  }

  render () {
    let rotationDropDown = null
    if (this.state.rotationNames !== null) {
      rotationDropDown = this.state.rotationNames.map((name, idx) => {
        let className = 'navbar-item'
        if (name === this.state.currentRotationName) {
          className = `${className} is-active`
        }
        return <Link to="/dashboard" key={name} className={className} onClick={this.onSelectRotationFactory(idx)}>{name}</Link>
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
                <Link className="navbar-item" to="/createRotation">Create New Rotation</Link>
                <hr className="navbar-divider"/>
                <a className="navbar-item" onClick={this.onLogoutHandler}>Logout</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <section className="section top-section">
        <div className="container">
          <Switch>
            <Route path="/dashboard" >
              <HighlightedTab>
                {dashboard}
              </HighlightedTab>
            </Route>
            <Route path="/configuration">
              <HighlightedTab>
                {this.state.currentRotation !== null ? <Configuration rotation={this.state.currentRotation} totalCycles={this.state.totalCycles}/>: null}
              </HighlightedTab>
            </Route>
            <Route path="/createRotation">
              <CreateRotation/>
            </Route>
          </Switch>
        </div>
      </section>
      </div>
    )
  }
}



export default DashboardContainer
