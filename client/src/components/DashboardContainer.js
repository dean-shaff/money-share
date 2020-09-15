import React, { useState } from "react"
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
import Moment from 'moment'

import User from "./User.js"
import { getTokenUserInfo } from "./../util.js"

import './DashboardContainer.css'


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
      <div className="tabs">
        <ul>
          <li className={getLiClassName("/dashboard")}><Link to="/dashboard">Dashboard</Link></li>
          <li className={getLiClassName("/configuration")}><Link to="/configuration">Configuration</Link></li>
          <li className={getLiClassName("/members")}><Link to="/members">Members</Link></li>
          <li className={getLiClassName("/queue")}><Link to="/queue">Queue</Link></li>
        </ul>
      </div>
      {children}
    </div>
  )
}


const Configuration = () => {
  return <div>Hello from Configuration</div>
}

const Dashboard = ({rotation, members, onStart}) => {

  const [timeRemaining, setTimeRemaining] = useState(null)

  if (rotation === null) {
    return null
  }

  if (rotation.started === null || ! rotation.started) {
    return (
      <div>
        <button className="button is-primary" onClick={onStart}>Start Rotation!</button>
      </div>
    )
  } else {
    let startDate = rotation.dateStarted
    let today = Moment()
    // setTimeRemaining()
    return (
      <div className="columns">
        <div className="column is-one-third">
          <div className="box">
            {timeRemaining} days left in cycle
          </div>
          <div className="box">
            Receiving money this cycle
          </div>
        </div>
        <div className="column is-two-thirds">
        </div>
      </div>
    )
  }
}


class DashboardContainer extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      username: null,
      rotations: null,
      currentRotation: null,
      currentRotationMembers: null,
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
        this.setState({
        })
        this.setState({
          'rotations': data,
          'currentRotation': data[0],
          'currentRotationName': data[0].name,
          'rotationNames': data.map(d => d.name)
        })
        let memberIds = data[0].members.map(member => member.id)
        return this.setCurrentRotationUsers(memberIds)
      })
  }

  setCurrentRotationUsers (memberIds) {
    return fetch(`/api/users`, {
      method: 'POST',
      body: JSON.stringify({ids: memberIds}),
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(resp => resp.json())
    .then(data => {
      this.setState({
        'currentRotationMembers': data.users
      })
    })
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
                <Dashboard
                  onStart={this.onStart}
                  rotation={this.state.currentRotation}
                  members={this.state.currentRotationMembers}/>
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

// <div className="dropdown">
//   <div className="dropdown-trigger">
//     <button className="button" aria-haspopup="true" aria-controls="dropdown-menu">
//       <span>{this.state.currentRotationName}</span>
//       <span className="icon is-small">
//         <FontAwesomeIcon icon={faAngleDown}/>
//       </span>
//     </button>
//   </div>
//   <div className="dropdown-menu" id="dropdown-menu" role="menu">
//     <div className="dropdown-content">
//       <a href="#" className="dropdown-item">
//         Dropdown item
//       </a>
//     </div>
//   </div>
// </div>


export default DashboardContainer
