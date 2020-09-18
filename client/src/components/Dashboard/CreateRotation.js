import React, { useState } from "react"
import qs from 'qs'
import { faInfoCircle, faClock, faDollarSign, faUser, faTimesCircle, faChevronDown, faChevronUp, faAt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { authFetch, getDefault } from "./../../util.js"

import InputField from './../InputField.js'
import "./CreateRotation.css"
import "./../User.css"


const ManualEntry = (props) => {
  return (
    <div>
      <form onSubmit={props.onSubmit}>
      <InputField type="text" name="username" placeholder="Username" icon={faUser}></InputField>
      <InputField type="text" name="name" placeholder="Name" icon={faUser}></InputField>
      <InputField type="email" name="email" placeholder="Email" icon={faAt}></InputField>
      <div className="field needs-bottom-margin">
        <div className="control">
          <button className="button is-primary is-fullwidth">Add</button>
        </div>
      </div>
      </form>
    </div>
  )
}



class AddMember extends React.Component {
  constructor (props) {
    super(props)
    const searchTypes = ['Username', 'Name']
    this.state = {
      'searchTypes': searchTypes,
      'searchType': searchTypes[0],
      'searchText': 'deanshaff',
      'displayManualAdd': false
    }
    this.onClick = this.onClick.bind(this)
    this.onSelect = this.onSelect.bind(this)
    this.onSearchType = this.onSearchType.bind(this)
    this.onToggleManualEntry = this.onToggleManualEntry.bind(this)
    this.onManualEntrySubmit = this.onManualEntrySubmit.bind(this)
  }

  onClick (evt) {
    let queryObj = {}
    queryObj[this.state.searchType.toLowerCase()] = this.state.searchText
    const query = qs.stringify(queryObj)
    console.log(`onClick: ${query}`)
    authFetch(`/api/user/search/?${query}`)
      .then(resp => resp.json())
      .then(data => {
        this.props.onAdd(data)
      })
  }

  onSelect (evt) {
    let val = evt.target.value
    this.setState({
      'searchType': val
    })
  }

  onSearchType (evt) {
    let val = evt.target.value
    this.setState({
      'searchText': val
    })
  }

  onManualEntrySubmit (evt) {
    evt.preventDefault()
    let formData = new FormData(evt.target)
    formData.append('autoCreated', true)
    for (const [key, val] of formData.entries()) {
      console.log(key, val)
    }
    // authFetch('/api/user', {
    //   method: "POST",
    //   body: formData
    // })
  }

  onToggleManualEntry (evt) {
    this.setState({
      'displayManualAdd': ! this.state.displayManualAdd
    })
  }


  render () {

    let manualEntryIcon = this.state.displayManualAdd ? (
      <FontAwesomeIcon icon={faChevronUp} />
    ) : (
      <FontAwesomeIcon icon={faChevronDown} />
    )

    let manualEntry = null
    if (this.state.displayManualAdd) {
      manualEntry = (
        <ManualEntry onSubmit={this.onManualEntrySubmit}/>
      )
    }

    return (
      <div className="box">
      <div className="field has-addons has-addons-centered">
        <div className="control is-expanded">
          <InputField type="text" name="name" value={this.state.searchText} onChange={this.onSearchType} placeholder="Search" icon={faUser}></InputField>
        </div>
        <div className="control">
          <span className="select" onChange={this.onSelect} value={this.state.searchType}>
            <select>
              {this.state.searchTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </span>
        </div>
        <div className="control">
          <a className="button is-primary" onClick={this.onClick}>
            Search
          </a>
        </div>
      </div>
      {manualEntry}
      <div className="field">
        <div className="control">
          <button className="button is-fullwidth is-slide-out is-small" onClick={this.onToggleManualEntry}><span>Manual Entry</span>
            <span className="icon">
              {manualEntryIcon}
            </span>
          </button>
        </div>
      </div>
      </div>
    )
  }
}

const MemberTable = (props) => {
  const members = props.members

  return (
    <div className="table-container">
      <table className="table">
        <thead>
         <tr>
           <th><abbr title="Position">Pos</abbr></th>
           <th>Username</th>
           <th>Name</th>
           <th></th>
         </tr>
        </thead>
        <tbody>
          {members.map((mem, idx) => (
            <tr key={mem.name}>
              <td>{idx + 1}</td>
              <td>{mem.username}</td>
              <td>{mem.name}</td>
              <td>
                <span className="icon is-small is-left has-text-danger" onClick={props.onRemoveFactory(mem)}>
                  <FontAwesomeIcon icon={faTimesCircle} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const Member = (props) => {
  return (
    <div className="box">
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <span className="icon is-small is-left has-text-danger" onClick={props.onRemoveFactory(props.user)}>
              <FontAwesomeIcon icon={faTimesCircle} />
            </span>
          </div>
          <div className="level-item">
            <div className="content">
              <p className="title is-7">{props.user.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


const MemberGrid = (props) => {
  const { members, tilesPerRow, onRemoveFactory } = props

  const nRows = Math.ceil(members.length / tilesPerRow)
  return [...Array(nRows).keys()].map(irow => {
    let [start, end] = [irow*tilesPerRow, (irow + 1)*tilesPerRow]
    let slice = members.slice(start, end)
    return (
      <div key={`row-${start}-${end}`} className="tile is-ancestor">
        {slice.map(mem => (
          <div key={mem.id} className="tile is-parent is-3">
            <article className="tile is-child">
              <Member user={mem}  onRemoveFactory={onRemoveFactory}/>
            </article>
          </div>
        ))}
      </div>
    )
  })

}



class CreateRotation extends React.Component {
  constructor(props) {
    super(props)
    const durationUnits = ['Days', 'Weeks', 'Months']
    this.state = {
      'durationUnits': durationUnits,
      'durationUnit': durationUnits[0],
      'members': [],
      'cycleDuration': '',
      'cycleAmount': '',
      'nonPayingCycles': '',
      'membersPerCycle': '',
      'name': ''
    }
    this.setStateFromProps(this.props)
    this.onSelect = this.onSelect.bind(this)
    this.onAdd = this.onAdd.bind(this)
    this.onRemoveFactory = this.onRemoveFactory.bind(this)
    this.onInputChange = this.onInputChange.bind(this)
  }

  componentDidUpdate(prevProps) {
    // console.log(`CreateRotation: ${prevProps.rotation}, ${this.props.rotation}`)
    if (prevProps.rotation === null && this.props.rotation !== null) {
      this.setStateFromProps(this.props)
    }
    // if (prevProps.)
  }

  setStateFromProps (props) {
    if (props.rotation !== null) {
      this.setState({
        'members': getDefault(props.rotation, 'members', []),
        'cycleDuration': getDefault(props.rotation, 'cycleDuration', ''),
        'cycleAmount': getDefault(props.rotation, 'cycleAmount', ''),
        'nonPayingCycles': getDefault(props.rotation, 'nonPayingCycles', ''),
        'membersPerCycle': getDefault(props.rotation, 'membersPerCycle', ''),
        'name': getDefault(props.rotation, 'name', '')
      })
    }
  }


  onSelect (evt) {
    let val = evt.target.value
    setDurationUnit(val)
  }

  onAdd (data){
    if (data.length > 0) {
      const datum = data[0]
      const members = this.state.members
      const memberIds = members.map(mem => mem.id)
      if (! memberIds.includes(datum.id)) {
        members.push(datum)
        this.setState({
          'members': members
        })
      }
    }
  }

  onRemoveFactory (member) {
    return (evt) => {
      const members = this.state.members
      const newMembers = members.filter(mem => mem.id !== member.id)
      this.setState({
        'members': newMembers
      })
    }
  }

  onInputChange (evt) {
    let name = evt.target.name
    this.setState({
      [name]: evt.target.value
    })
  }

  render () {
    let memberDisplay = null
    if (this.state.members.length > 0) {
      memberDisplay = (
        <div className="box">
          <MemberGrid members={this.state.members} tilesPerRow={4} onRemoveFactory={this.onRemoveFactory}/>
        </div>
      )
    }

    let titleText = 'Create a new Rotation'
    if (this.props.rotation !== null) {
      titleText = `Update ${this.props.rotation.name}!`
    }


    return (
      <div>
      <h4 className="title is-4">{titleText}</h4>
        <div className="columns">
          <div className="column is-one-quarter">
            <InputField type="text" name="name" label="Name" value={this.state.name
            } onChange={this.onInputChange} icon={faInfoCircle}></InputField>
            <div className="field">
              <label className="label">Duration</label>
              <div className="field has-addons">
                <div className="control is-expanded">
                  <InputField type="text" onChange={this.onInputChange} name="cycleDuration" value={this.state.cycleDuration} icon={faClock}></InputField>
                </div>
                <div className="control">
                  <span className="select" onChange={this.onSelect} value={this.state.durationUnit}>
                    <select>
                      {this.state.durationUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                    </select>
                  </span>
                </div>
              </div>
            </div>
            <InputField type="text" onChange={this.onInputChange} name="cycleAmount" value={this.state.cycleAmount} label="Cycle Payment" icon={faDollarSign}></InputField>
            <InputField type="number" onChange={this.onInputChange} name="nonPayingCycles" value={this.state.nonPayingCycles} label="Nonpaying Cycles" icon={faInfoCircle}></InputField>
            <InputField type="number" onChange={this.onInputChange} name="membersPerCycle" value={this.state.membersPerCycle} label="Members per Cycle" icon={faUser}></InputField>
          </div>
          <div className="column is-one-half">
            <h5 className="title is-5">Members</h5>

            {memberDisplay}
            <AddMember onAdd={this.onAdd}/>
          </div>
        </div>
      </div>
    )
  }
}

export default CreateRotation
