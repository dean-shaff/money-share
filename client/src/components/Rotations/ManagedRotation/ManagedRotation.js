import React from 'react'
import { useLocation, Route, Link, Redirect } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { DateTime } from 'luxon'


import Dashboard from './Dashboard.js'
import Configuration from './Configuration.js'
import UpdateRotation from './UpdateRotation.js'
import CreateRotation from './CreateRotation.js'
import {
  deleteNote,
  createNote,
  stringify
} from "./../../../util.js"

import './ManagedRotation.css'


const getLiClassNameFactory = (highlightPathName) => {
  return (pathName) => {
    if (highlightPathName === pathName) {
      return 'is-active'
    } else {
      return ''
    }
  }
}

const HighlightedTab = (props) => {
  const location = useLocation()
  const pathSplit = location.pathname.split('/')
  const relativePath = pathSplit[pathSplit.length - 1]
  const getLiClassName = getLiClassNameFactory(relativePath)
  const filteredRotations = props.rotations.filter(rot => rot.id !== props.rotation.id)
  return (
    <div className="container">
      <nav className="navbar is-spaced is-below">
        <div className="navbar-brand">
          <Link to={'/rotations'} className="navbar-item">
            <span className="icon is-small">
              <FontAwesomeIcon icon={faHome} size="lg"/>
            </span>
          </Link>
        </div>
        <div className="navbar-menu is-active">
          <div className="navbar-start">
            <div className="navbar-item has-dropdown is-hoverable">
                  <a className="navbar-link">
                    {props.rotation.name}
                  </a>
                  <div className="navbar-dropdown">
                    {filteredRotations.map(rot => (
                      <Link key={rot.id} className="navbar-item" to={`/rotations/managedRotation/${rot.id}`}>{rot.name}</Link>
                    ))}
                  </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="tabs is-medium is-boxed">
        <ul>
          <li className={getLiClassName("dashboard")}><Link to={`${props.match.url}/dashboard`}>Dashboard</Link></li>
          <li className={getLiClassName("configuration")}><Link to={`${props.match.url}/configuration`}>Configuration</Link></li>
        </ul>
      </div>
      {props.children}
    </div>
  )
}

class ManagedRotation extends React.Component {

  constructor(props) {
    super(props)
    this.onUserPaidChangeFactory = this.onUserPaidChangeFactory.bind(this)
  }

  onUserPaidChangeFactory (rotation) {
    return (user, paid) => {
      console.log(`onUserPaidChange`)
      const rotationId = rotation.id
      const userId = user.id
      if (! paid) {
        console.log(`Rotations.onUserPaidChange: deleting newest note`)
        let notes = user.CycleNotes
        let mostRecent = notes[notes.length - 1]
        deleteNote(userId, mostRecent.id)
          .then(resp => {
            if (resp.status === 204) {
              let currentRotation = JSON.parse(JSON.stringify(rotation))
              for (let idx=0; idx<currentRotation.members.length; idx++) {
                if (currentRotation.members[idx].id === userId) {
                  currentRotation.members[idx].paid = false
                  currentRotation.members[idx].CycleNotes.pop()
                  break
                }
              }
              this.props.onChange(currentRotation)
            }
          })
      } else {
        console.log(`Rotations.onUserPaidChange: creating new note`)
        const datePaid = DateTime.local().toISO()
        const amountPaid = rotation.cycleAmount
        // userId, rotationId, datePaid, amountPaid
        createNote(userId, rotationId, datePaid, amountPaid)
          .then(resp => resp.json())
          .then(data => {
            let currentRotation = JSON.parse(JSON.stringify(rotation))
            for (let idx=0; idx<currentRotation.members.length; idx++) {
              if (currentRotation.members[idx].id == userId) {
                currentRotation.members[idx].paid = true
                currentRotation.members[idx].CycleNotes.push(data)
                break
              }
            }
            this.props.onChange(currentRotation)
          })
      }
    }
  }

  // render() {
  //   let dashboard = null
  //   let update = null
  //   let configuration = null
  //   let base = <Redirect to={`${this.props.match.url}/dashboard`}/>
  //
  //   const rotationId = this.props.match.params.rotationId
  //   let rotation = this.props.rotations.find(rot => rot.id === rotationId)
  //
  //   if (rotation != null) {
  //     // this.props.onSetCurrentRotation(rotation)
  //     let computed = computeMembersPaid(rotation)
  //     configuration = (
  //       <HighlightedTab match={this.props.match}>
  //         <Configuration totalCycles={computed.totalCycles} rotation={computed.rotation}/>
  //       </HighlightedTab>
  //     )
  //     if (rotation.started) {
  //       dashboard = (
  //         <HighlightedTab match={this.props.match}>
  //           <Dashboard tilesPerRow={4} onUserPaidChange={this.onUserPaidChangeFactory(rotation)} {...computed}/>
  //         </HighlightedTab>
  //       )
  //       update = <Redirect to={`${this.props.match.url}/dashboard`}/>
  //     } else {
  //       dashboard = <Redirect to={`${this.props.match.url}/update`}/>
  //       update = <UpdateRotation rotation={computed.rotation} onChange={this.props.onChange} onDelete={this.props.onDelete}/>
  //       base = <Redirect to={`${this.props.match.url}/update`}/>
  //     }
  //   }
  //
  //   if (rotationId === 'create') {
  //     base = <CreateRotation onChange={this.props.onChange}/>
  //   }
  //
  //   return (
  //     <div>
  //       <Route path={`${this.props.match.path}/dashboard`}>
  //         {dashboard}
  //       </Route>
  //       <Route path={`${this.props.match.path}/configuration`}>
  //         {configuration}
  //       </Route>
  //       <Route path={`${this.props.match.path}/update`}>
  //         {update}
  //       </Route>
  //       <Route path={`${this.props.match.path}`}>
  //         {base}
  //       </Route>
  //     </div>
  //   )
  // }
  render() {
    console.log(`ManagedRotation.render`)
    let dashboard = () => null
    let update = () => null
    let configuration = () => null
    let base = <Redirect to={`${this.props.match.url}/dashboard`}/>

    const rotationId = this.props.match.params.rotationId
    let rotation = this.props.rotations.find(rot => rot.id === rotationId)

    if (rotation != null) {
      console.log(`ManagedRotation.render: rotation.started=${rotation.started}`)
      // this.props.onSetCurrentRotation(rotation)
      if (rotation.started) {
        configuration = (props) => (
          <HighlightedTab match={this.props.match} rotation={rotation} rotations={this.props.rotations}>
            <Configuration
              rotation={rotation}
              onChange={this.props.onChange}
              onDelete={this.props.onDelete} {...props}/>
          </HighlightedTab>
        )

        dashboard = (props) => (
          <HighlightedTab match={this.props.match} rotation={rotation} rotations={this.props.rotations}>
            <Dashboard
              tilesPerRow={4}
              onUserPaidChange={this.onUserPaidChangeFactory(rotation)}
              onSetCurrentRotation={this.props.onSetCurrentRotation} {...props} rotation={rotation}/>
          </HighlightedTab>
        )
        update = (props) => (<Redirect to={`${this.props.match.url}/dashboard`}/>)
      } else {
        dashboard = (props) => (<Redirect to={`${this.props.match.url}/update`}/>)
        configuration = (props) => (<Redirect to={`${this.props.match.url}/update`}/>)
        update = props => (
          <UpdateRotation
            onSetCurrentRotation={this.props.onSetCurrentRotation}
            rotation={rotation}
            onChange={this.props.onChange}
            onDelete={this.props.onDelete} {...props}/>
        )
        base = <Redirect to={`${this.props.match.url}/update`}/>
      }
    }

    if (rotationId === 'create') {
      base = <CreateRotation onChange={this.props.onChange}/>
    }

    return (
      <div>
        <Route path={`${this.props.match.path}/dashboard`} render={dashboard}/>
        <Route path={`${this.props.match.path}/configuration`} render={configuration}/>
        <Route path={`${this.props.match.path}/update`} render={update}/>
        <Route path={`${this.props.match.path}`}>
          {base}
        </Route>
      </div>
    )
  }}


export default ManagedRotation
