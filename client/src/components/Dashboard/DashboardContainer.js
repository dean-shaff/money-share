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
import moment from 'moment'

import User from "./../User.js"
import Dashboard from "./Dashboard.js"
import Configuration from "./Configuration.js"
import { getTokenUserInfo, getCycleNumberTotalCycles } from "./../../util.js"
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
    }
    this.onLogoutHandler = this.onLogoutHandler.bind(this)
    this.onPlusCircleClick = this.onPlusCircleClick.bind(this)
    this.onStart = this.onStart.bind(this)
  }

  componentDidMount() {
    const tokenUserInfo = getTokenUserInfo()
    this.setState({
      'username': tokenUserInfo.username
    })
    fetch(`/api/user/${tokenUserInfo.id}/rotations`)
      .then(resp => resp.json())
      .then(data => {

        let currentRotation = this.computeMembersPaid(data[0])

        this.setState({
          'rotations': data,
          'currentRotation': currentRotation,
          'currentRotationName': currentRotation.name,
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

  computeMembersPaid (rotation) {
    if (! rotation.started) {
      return {}
    }


    const dateCompare = (a, b) => {
      let dateA = moment(a.datePaid, dateFormat)
      let dateB = moment(b.datePaid, dateFormat)
      let diff = dateA.diff(dateB)
      if (diff > 0) {
        return 1
      } else if (diff === 0) {
        return 0
      } else {
        return -1
      }
    }

    let dateStarted = moment(rotation.dateStarted, dateFormat)
    let [cycleNumber, totalCycles] = getCycleNumberTotalCycles(rotation)
    let thisCycleStartDate = dateStarted.add(cycleNumber*rotation.cycleDuration, 'days')

    const members = rotation.members
    for (let idx=0; idx<members.length; idx++) {
      let member = members[idx]
      let notes = member.CycleNotes
      rotation.members[idx].paid = false
      if (notes.length > 0) {
        notes.sort(dateCompare)
        let mostRecent = notes[notes.length - 1]
        let mostRecentPaid = moment(mostRecent.datePaid, dateFormat)
        if (mostRecentPaid.isSameOrAfter(thisCycleStartDate)) {
          rotation.members[idx].paid = true
        }
      }
    }

    return rotation
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
