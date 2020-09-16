import React from "react"
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faSort } from '@fortawesome/free-solid-svg-icons'

import User from './../User.js'
import { roll, getCycleNumberTotalCycles } from './../../util.js'

const dateFormat = "MMMM Do, YYYY"

const BlueHighlight = ({text}) => {
  return <span className="blue-highlight">{text}</span>
}

class ActivityGridRow extends React.Component {

  constructor(props) {
    super(props)
  }

  render () {
    return (
      <div className="tile is-ancestor">
        {this.props.members.map(mem => (
          <div key={mem.name} className="tile is-parent is-3">
            <div className="tile is-child">
              <User user={mem}/>
            </div>
          </div>
        ))}
      </div>
    )
  }
}

class ActivityGrid extends React.Component {

  constructor(props) {
    super(props)
  }

  render () {
    const members = this.props.members
    const tilesPerRow = this.props.tilesPerRow
    const nRows = Math.ceil(members.length / tilesPerRow)
    let grid = []
    for (let irow=0; irow<nRows; irow++) {
      let [start, end] = [irow*tilesPerRow, (irow + 1)*tilesPerRow]
      grid.push(<ActivityGridRow key={irow.toString()} members={members.slice(start, end)} />)
    }
    return grid
  }

}


class Dashboard extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      'filteredMembers': this.props.rotation.members
    }
    this.onSearch = this.onSearch.bind(this)
  }

  onSearch (evt) {
    const val = evt.currentTarget.value.toLowerCase()
    let filteredMembers = this.props.rotation.members.filter(mem => {
      let name = mem.name.toLowerCase()
      if (name.includes(val)) {
        return true
      }
      return false
    })
    this.setState({
      'filteredMembers': filteredMembers
    })
  }

  getDaysRemaining (dateStarted, cycleDuration)  {
    let dateStartedObj = moment(dateStarted, dateFormat)
    let nextCycle = dateStartedObj.add(cycleDuration, 'days')
    let today = moment()
    let delta = nextCycle.diff(today, 'days')
    return delta
  }



  reOrderMembers (rotation) {

    let members = rotation.members.slice()
    let membersPerCycle = rotation.membersPerCycle

    let [cycleNumber, totalCycles] = getCycleNumberTotalCycles(rotation)

    let reOrderedMembers = []
    for (let icycle=0; icycle<totalCycles; icycle++) {
      let subArr = []
      for (let imember=0; imember<membersPerCycle; imember++) {
        subArr.push(members.shift())
      }
      reOrderedMembers.push(subArr)
    }
    roll(reOrderedMembers, cycleNumber)
    return reOrderedMembers
  }

  createMemberElements (members) {
    return members.map((mem, idx) => <User key={mem.name} user={mem}/>)
  }

  render () {
    const rotation = this.props.rotation
    console.log(this.props.membersPaid)

    // console.log(`Dashboard.render: rotation=${JSON.stringify(rotation, null, 2)}`)
    let nonPayingCycles = rotation.nonPayingCycles
    let daysRemaining = this.getDaysRemaining(
      rotation.dateStarted, rotation.cycleDuration)
    let [cycleNumber, totalCycles] = getCycleNumberTotalCycles(rotation)
    let reOrderedMembers = this.reOrderMembers(rotation)

    let cycleRecipients = this.createMemberElements(reOrderedMembers[0])
    let cycleNotPaying = this.createMemberElements(reOrderedMembers.slice(-nonPayingCycles).flat())

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
                  <input className="input is-rounded is-small" onChange={this.onSearch} type="text" placeholder="Search"/>
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
              <ActivityGrid members={this.state.filteredMembers} tilesPerRow={this.props.tilesPerRow}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Dashboard
