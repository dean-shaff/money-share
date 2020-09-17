import React from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faSort, faAngleDown } from '@fortawesome/free-solid-svg-icons'

import User from './../User.js'
import { roll } from './../../util.js'

import "./Dashboard.css"

const BlueHighlight = ({text}) => {
  return <span className="has-text-primary">{text}</span>
}

const ActivityGridElement = (props) => {
  return (
    <div className="tile is-parent is-3">
      <article className="tile is-child">
        <User onClick={props.onClick} user={props.user}/>
      </article>
    </div>
  )
}

const ActivityGridRow = (props) =>  {
  return (
    <div className="tile is-ancestor">
      {props.members.map(mem => (
        <ActivityGridElement key={mem.id} user={mem} onClick={props.onClick}/>
      ))}
    </div>
  )
}

const ActivityGrid = (props) => {
  const members = props.members
  const tilesPerRow = props.tilesPerRow
  const nRows = Math.ceil(members.length / tilesPerRow)
  return [...Array(nRows).keys()].map(irow => {
    let [start, end] = [irow*tilesPerRow, (irow + 1)*tilesPerRow]
    return (<ActivityGridRow key={`row-${start}-${end}`} members={members.slice(start, end)} onClick={props.onClick} />)
  })
}



class Dashboard extends React.Component {

  constructor(props) {
    super(props)
    this.sortOptions = [
      "All",
      "Paid",
      "Unpaid",
      "Paying",
      "Not paying"
    ]
    this.state = {
      'searchText': '',
      'selectedSort': this.sortOptions[0]
    }
    this.onSearch = this.onSearch.bind(this)
    this.onSort = this.onSort.bind(this)
  }

  onSearch (evt) {
    const val = evt.currentTarget.value.toLowerCase()
    this.setState({
      'searchText': val
    })
  }

  onSort (evt) {
    const selected = evt.target.options[evt.target.selectedIndex].text
    console.log(`onSort: selected=${selected}`)
    this.setState({
      'selectedSort': selected
    })
  }

  filterMembersBySearch (text, members) {
    let filteredMembers = members.filter(mem => {
      let name = mem.name.toLowerCase()
      if (name.includes(text)) {
        return true
      }
      return false
    })
    return filteredMembers
  }

  filterMembersBySort (selectedSort, members) {
    if (selectedSort === "All") {
      return members
    }
    return members.filter(mem => {
      if (selectedSort === this.sortOptions[1]) {
        return mem.paid
      } else if (selectedSort === this.sortOptions[2]) {
        return ! mem.paid
      } else if (selectedSort === this.sortOptions[3]) {
        return ! mem.nonPaying
      } else if (selectedSort === this.sortOptions[4]) {
        return  mem.nonPaying
      }
    })
  }

  reOrderMembers (rotation, totalCycles, cycleNumber) {

    let members = rotation.members.slice()
    let membersPerCycle = rotation.membersPerCycle

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
    return members.map((mem, idx) => (<User onClick={this.props.onUserPaidChange} key={mem.name} user={mem}/>))
  }

  render () {
    console.log(`Dashboard.render`)
    const rotation = this.props.rotation
    const nonPayingCycles = rotation.nonPayingCycles
    let reOrderedMembers = this.reOrderMembers(
      rotation,
      this.props.totalCycles,
      this.props.cycleNumber
    )

    let cycleRecipients = this.createMemberElements(reOrderedMembers[0])
    let cycleNotPaying = this.createMemberElements(reOrderedMembers.slice(-nonPayingCycles).flat())
    let filteredMembers = this.filterMembersBySearch(this.state.searchText, rotation.members)
    filteredMembers = this.filterMembersBySort(this.state.selectedSort, filteredMembers)
    // let cycleRecipients = null
    // let cycleNotPaying = null

    return (
      <div className="columns">
        <div className="column is-one-quarter">
          <div className="box">
            <h4 className="title is-4">
              This is cycle <BlueHighlight text={this.props.cycleNumber + 1}/> of <BlueHighlight text={this.props.totalCycles}/>
            </h4>
            <h4 className="title is-4">
              There are <BlueHighlight text={this.props.daysRemaining}/> days left in this cycle
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
        <div className="column">
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
                  <div className="field is-horizontal">
                    {/*<div className="field-label is-small">
                      <label className="label is-small">Sort By</label>
                    </div>*/}
                    <div className="field-label is-small sort-by">
                      <label className="label">Sort By:</label>
                    </div>
                    <div className="field-body">
                      <div className="control">
                        <div className="select is-small" onChange={this.onSort}>
                          <select>
                            {this.sortOptions.map(op => <option key={op}>{op}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
            <div className="container top-container">
              <ActivityGrid members={filteredMembers} tilesPerRow={this.props.tilesPerRow} onClick={this.props.onUserPaidChange}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Dashboard
