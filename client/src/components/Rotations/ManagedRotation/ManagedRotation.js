import React from 'react'
import { useLocation, Route, Link, Redirect } from "react-router-dom";
import { DateTime } from 'luxon'

import Dashboard from './Dashboard.js'
import Configuration from './Configuration.js'
import UpdateRotation from './UpdateRotation.js'
import CreateRotation from './CreateRotation.js'
import {
  deleteNote,
  createNote,
  computeMembersPaid,
  getRotation
} from "./../../../util.js"


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
  return (
    <div className="container">
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
    this.state = {
      'rotation': null,
      'cycleNumber': null,
      'totalCycles': null,
      'daysRemaining': null,
      'cycleStartDate': null
    }
    this.onUserPaidChange = this.onUserPaidChange.bind(this)
  }

  setRotation(newRotation) {
    console.log(`ManagedRotation.setRotation`)
    if (newRotation === undefined) {
      console.log(`ManagedRotation.setRotation: newRotation is undefined`)
      return
    }
    if (! newRotation.started) {
      // console.log(`ManagedRotation.setRotation: redirecting to ${this.props.match.url}/update`)
      this.setState({
        'rotation': newRotation
      })
      return
    }
    let {rotation, cycleNumber, totalCycles, daysRemaining, cycleStartDate} = computeMembersPaid(newRotation)
    this.setState({
      'rotation': rotation,
      'cycleNumber': cycleNumber,
      'totalCycles': totalCycles,
      'daysRemaining': daysRemaining,
      'cycleStartDate': cycleStartDate
    })
  }

  setRotationFromProps(props) {
    const rotationId = this.props.match.params.rotationId
    let rotation = this.props.rotations.find(rot => rot.id === rotationId)
    this.setRotation(rotation)

    // if (this.props.rotations === undefined) {
    //   // this means we have to GET the rotation
    //   getRotation(rotationId)
    //     .then(resp => resp.json())
    //     .then(rot => this.setRotation(rot))
    // } else {
    //   let rotation = this.props.rotations.find(rot => rot.id === rotationId)
    //   this.setRotation(rotation)
    // }
  }

  async componentDidMount () {
    await this.setRotationFromProps()
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.match.params.rotationId !== this.props.match.params.rotationId) {
      console.log(`ManagedRotation.componentDidUpdate: rotationIds are different`)
      await this.setRotationFromProps()
      return
    }
    if (prevProps.rotations.length !== this.props.rotations.length) {
      // means we either added a rotation or we simply got them from the server
      console.log(`ManagedRotation.componentDidUpdate: lengths are different: prev length=${prevProps.rotations.length}, this length=${this.props.rotations.length}`)
      await this.setRotationFromProps()
      return
    }
    if (this.props.rotations.length > 0) {
      const rotationId = this.props.match.params.rotationId
      let rotation = this.props.rotations.find(rot => rot.id === rotationId)
      let prevRotation = prevProps.rotations.find(rot => rot.id === rotationId)
      if (rotation !== undefined && prevRotation !== undefined) {
        if (rotation.started !== prevRotation.started) {
          // testing whether we started our rotation
          this.setRotation(rotation)
          return
        }
      }
      if (rotation === undefined) {
        console.log(`ManagedRotation.componentDidUpdate: rotation is gone!`)
      }
    }


  }

  onUserPaidChange (evt, user, paid) {
    console.log(`onUserPaidChange`)
    const rotationId = this.state.rotation.id
    const userId = user.id
    if (! paid) {
      console.log(`Rotations.onUserPaidChange: deleting newest note`)
      let notes = user.CycleNotes
      let mostRecent = notes[notes.length - 1]
      deleteNote(userId, mostRecent.id)
        .then(resp => {
          if (resp.status === 204) {
            let currentRotation = JSON.parse(JSON.stringify(this.state.rotation))
            for (let idx=0; idx<currentRotation.members.length; idx++) {
              if (currentRotation.members[idx].id === userId) {
                currentRotation.members[idx].paid = false
                currentRotation.members[idx].CycleNotes.pop()
                break
              }
            }
            this.setState({'rotation': currentRotation})
          }
        })
    } else {
      console.log(`Rotations.onUserPaidChange: creating new note`)
      const datePaid = DateTime.local().toISO()
      const amountPaid = this.state.rotation.cycleAmount
      // userId, rotationId, datePaid, amountPaid
      createNote(userId, rotationId, datePaid, amountPaid)
        .then(resp => resp.json())
        .then(data => {
          let currentRotation = JSON.parse(JSON.stringify(this.state.rotation))
          for (let idx=0; idx<currentRotation.members.length; idx++) {
            if (currentRotation.members[idx].id == userId) {
              currentRotation.members[idx].paid = true
              currentRotation.members[idx].CycleNotes.push(data)
              break
            }
          }
          this.setState({'rotation': currentRotation})
        })
    }
  }

  render() {
    // console.log(`ManagedRotation.render`)
    // console.log(`ManagedRotation.render: match=${JSON.stringify(this.props.match, null, 2)}`)
    let dashboard = null
    let update = null
    let configuration = null
    let base = <Redirect to={`${this.props.match.url}/dashboard`}/>

    if (this.state.rotation != null) {
      // console.log(`ManagedRotation.render: rotation !== null`)
      // console.log(`ManagedRotation.render: rotation.name=${this.state.rotation.name} rotation.started=${this.state.rotation.started}`)
      configuration = (
        <HighlightedTab match={this.props.match}>
          <Configuration totalCycles={this.state.totalCycles} rotation={this.state.rotation}/>
        </HighlightedTab>
      )
      if (this.state.rotation.started) {
        // console.log(`ManagedRotation.render: ${this.state.rotation.name} started`)
        dashboard = (
          <HighlightedTab match={this.props.match}>
            <Dashboard tilesPerRow={4} onUserPaidChange={this.onUserPaidChange} {...this.state}/>
          </HighlightedTab>
        )
        update = <Redirect to={`${this.props.match.url}/dashboard`}/>
      } else {
        // console.log(`ManagedRotation.render: ${this.state.rotation.name} not started`)
        dashboard = <Redirect to={`${this.props.match.url}/update`}/>
        update = <UpdateRotation rotation={this.state.rotation} onChange={this.props.onChange} onDelete={this.props.onDelete}/>
        base = <Redirect to={`${this.props.match.url}/update`}/>
      }
    }

    if (this.props.match.params.rotationId === 'create') {
      console.log(`ManagedRotation.render: setting base to CreateRotation`)
      base = <CreateRotation onChange={this.props.onChange}/>
    }

    return (
      <div>
        <Route path={`${this.props.match.path}/dashboard`}>
          {dashboard}
        </Route>
        <Route path={`${this.props.match.path}/configuration`}>
          {configuration}
        </Route>
        <Route path={`${this.props.match.path}/update`}>
          {update}
        </Route>
        <Route path={`${this.props.match.path}`}>
          {base}
        </Route>
      </div>
    )
  }
}


export default ManagedRotation
