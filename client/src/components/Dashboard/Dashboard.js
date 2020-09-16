import React from "react"
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faSort } from '@fortawesome/free-solid-svg-icons'
import User from './../User.js'

const dateFormat = "MMMM Do, YYYY"

const BlueHighlight = ({text}) => {
  return <span className="blue-highlight">{text}</span>
}

class ActivityGrid extends React.Component {

}


class Dashboard extends React.Component {

  constructor(props) {
    super(props)
  }

  roll (arr, places) {
    for (let idx = 0; idx < places; idx++) {
      arr.unshift(arr.pop());
      // arr.push(arr.shift());
    }
  }

  getDaysRemaining (dateStarted, cycleDuration)  {
    let dateStartedObj = moment(dateStarted, dateFormat)
    // console.log(`dateStartedObj=${dateStartedObj}`)
    let nextCycle = dateStartedObj.add(cycleDuration, 'days')
    // console.log(`nextCycle=${nextCycle}`)
    let today = moment()
    let delta = nextCycle.diff(today, 'days')
    // console.log(`delta=${delta}`)
    return delta
  }

  getCycleNumberTotalCycles (rotation) {
    let dateStarted = rotation.dateStarted
    let membersPerCycle = rotation.membersPerCycle
    let totalMembers = rotation.members.length
    let cycleDuration = rotation.cycleDuration

    let totalCycles = totalMembers / membersPerCycle

    let dateStartedObj = moment(dateStarted, dateFormat)
    let today = moment()

    let daysSinceStart = today.diff(dateStartedObj, 'days')
    let cycleNumber = Math.floor(daysSinceStart/cycleDuration)

    return [cycleNumber, totalCycles]
  }

  reOrderMembers (rotation) {

    let members = rotation.members.slice()
    let membersPerCycle = rotation.membersPerCycle

    let [cycleNumber, totalCycles] = this.getCycleNumberTotalCycles(rotation)

    let reOrderedMembers = []
    for (let icycle=0; icycle<totalCycles; icycle++) {
      let subArr = []
      for (let imember=0; imember<membersPerCycle; imember++) {
        subArr.push(members.shift())
      }
      reOrderedMembers.push(subArr)
    }
    this.roll(reOrderedMembers, cycleNumber)
    return reOrderedMembers
  }

  createMemberElements (members) {
    return members.map((mem, idx) => <User key={mem.name} user={mem}/>)
  }

  makeActivityGrid (members) {
    const tilesPerRow = this.props.tilesPerRow
    const nRows = Math.ceil(members.length / tilesPerRow)
    let grid = []
    for (let irow=0; irow<nRows; irow++) {
      let row = []
      for (let icol=0; icol<tilesPerRow; icol++) {
        let idx = icol + irow*tilesPerRow
        if (idx < members.length) {
          row.push((
            <div className="tile is-parent is-3">
              <div className="tile is-child">
                <User key={members[idx].name} user={members[idx]}/>
              </div>
            </div>
          ))
        }
      }
      grid.push((
        <div key={irow.toString()} className="tile is-ancestor">
          {row}
        </div>
      ))
    }
    return grid
  }

  render () {
    const rotation = this.props.rotation
    // console.log(`Dashboard.render: rotation=${JSON.stringify(rotation, null, 2)}`)
    if (rotation === null) {
      return null
    }
    if (rotation.started === null || ! rotation.started) {
      return (
        <div>
          <button className="button is-primary" onClick={this.props.onStart}>Start Rotation!</button>
        </div>
      )
    } else {
      let nonPayingCycles = rotation.nonPayingCycles
      let daysRemaining = this.getDaysRemaining(
        rotation.dateStarted, rotation.cycleDuration)
      let [cycleNumber, totalCycles] = this.getCycleNumberTotalCycles(rotation)
      let reOrderedMembers = this.reOrderMembers(rotation)

      let cycleRecipients = this.createMemberElements(reOrderedMembers[0])
      let cycleNotPaying = this.createMemberElements(reOrderedMembers.slice(-nonPayingCycles).flat())
      let members = rotation.members
      // let activityGrid = null
      let activityGrid = this.makeActivityGrid(members)


      return (
        <div className="columns">
          <div className="column is-one-third">
            <div className="box">
              <h4 className="title is-4">
                This is cycle <BlueHighlight text={cycleNumber + 1}/> of <BlueHighlight text={totalCycles}/>
              </h4>
              <h4 className="title is-4">
                There are <BlueHighlight text={daysRemaining}/> days left in this cycle
              </h4>
            </div>
            <div className="box">
              <div>
                <h4 className="title is-4">This cycle's Recipients</h4>
                <div>
                  {cycleRecipients}
                </div>
              </div>
            </div>
            <div className="box">
              <div>
                <h4 className="title is-4">Not Paying this cycle</h4>
                <div>
                  {cycleNotPaying}
                </div>
              </div>
            </div>
          </div>
          <div className="column is-two-thirds">
            <div className="box">
              <nav className="navbar has-shadow">
                <div className="navbar-menu">
                  <div className="navbar-item">
                    <h4 className="title is-4">Activity</h4>
                  </div>
                </div>
                <div className="navbar-end">
                  <div className="navbar-item">
                  <p className="control has-icons-left">
                    <input className="input is-rounded is-small" type="text" placeholder="Search"/>
                    <span className="icon is-left">
                      <FontAwesomeIcon icon={faSearch}/>
                    </span>
                  </p>
                  </div>
                  <div className="navbar-item">
                    <span className="icon">
                      <FontAwesomeIcon icon={faSort}/>
                    </span>
                  </div>
                </div>
              </nav>
              <div className="container">
                {activityGrid}
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}

export default Dashboard
