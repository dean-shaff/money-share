import React from 'react'
import { useLocation, Route, Link, Redirect } from "react-router-dom";

import Dashboard from './Dashboard.js'
import Configuration from './Configuration.js'
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
  }

  setRotation(newRotation) {
    if (newRotation === undefined) {
      return
    }
    if (! newRotation.started) {
      // console.log(`ManagedRotation.setRotation: redirecting to ${this.props.match.url}/update`)
      this.setState({
        'rotation': newRotation
      })
      // this.props.history.push(`${this.props.match.url}/update`)
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
    // console.log(`ManagedRotation.setRotationFromProps`)
    // console.log(`ManagedRotation.setRotationFromProps: match=${JSON.stringify(thos.props.match, null, 2)}`)
    // if (props.match === undefined) {
    //   console.log(`ManagedRotation.setRotationFromProps: match is undefined`)
    // }
    const rotationId = this.props.match.params.rotationId
    if (this.props.rotations === undefined) {
      // this means we have to GET the rotation
      getRotation(rotationId)
        .then(resp => resp.json())
        .then(rot => this.setRotation(rot))
    } else {
      let rotation = this.props.rotations.find(rot => rot.id === rotationId)
      this.setRotation(rotation)
    }
  }

  async componentDidMount () {
    await this.setRotationFromProps()
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.match.params.rotationId !== this.props.match.params.rotationId) {
      await this.setRotationFromProps()
    }
    if (prevProps.rotations.length !== this.props.rotations.length) {
      await this.setRotationFromProps()
    }
  }

  onUserPaidChange (evt, user, paid) {
    console.log(`onUserPaidChange`)
    const rotationId = this.state.currentRotation.id
    const userId = user.id
    if (! paid) {
      console.log(`Rotations.onUserPaidChange: deleting newest note`)
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
      console.log(`Rotations.onUserPaidChange: creating new note`)
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

  render() {
    console.log(`ManagedRotation.render: match=${JSON.stringify(this.props.match, null, 2)}`)
    let dashboard = null
    let update = null
    let configuration = null
    let base = <Redirect to={`${this.props.match.url}/dashboard`}/>

    if (this.props.match.params.rotationId === 'create') {
      base = <div>Hello from create</div>
    }


    if (this.state.rotation != null) {
      console.log(`ManagedRotation.render: rotation.name=${this.state.rotation.name} rotation.started=${this.state.rotation.started}`)
      configuration = (
        <HighlightedTab match={this.props.match}>
          <Configuration totalCycles={this.state.totalCycles} rotation={this.state.rotation}/>
        </HighlightedTab>
      )
      if (this.state.rotation.started) {
        dashboard = (
          <HighlightedTab match={this.props.match}>
            <Dashboard tilesPerRow={4} {...this.state}/>
          </HighlightedTab>
        )
        update = <Redirect to={`${this.props.match.url}/dashboard`}/>
      } else {
        dashboard = <Redirect to={`${this.props.match.url}/update`}/>
        // update = <CreateUpdateRotation rotation={this.state.rotation}/>
        update = <div>{this.state.rotation.name}</div>
        base = <Redirect to={`${this.props.match.url}/update`}/>
      }
    }
    // console.log(`ManagedRotation.render: ${JSON.stringify(base, null, 2)}`)
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
