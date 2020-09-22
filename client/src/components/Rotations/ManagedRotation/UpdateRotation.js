import React, { useState } from "react"
import qs from 'qs'
import { faInfoCircle, faClock, faDollarSign, faUser, faTimesCircle, faChevronDown, faChevronUp, faAt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DateTime } from 'luxon'
import slug from 'slug'

import InputField from './../../InputField.js'
import CreateUpdateRotationForm from "./CreateUpdateRotationForm"
import { authFetch, getDefault, getTokenUserInfo, createRotation, updateRotation, deleteRotation } from "./../../../util.js"

import "./UpdateRotation.css"
import "./../../User.css"


const ManualEntry = (props) => {
  return (
    <div>
      <form onSubmit={props.onSubmit}>
      <InputField type="text" name="name" placeholder="Name" icon={faUser}></InputField>
      {/*<InputField type="text" name="username" placeholder="Username" icon={faUser}></InputField>*/}
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
      'searchText': '',
      'displayManualAdd': false,
      'errorMsg': ''
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
        if (data.length === 0) {
          this.setState({
            'errorMsg': "Couldn't find that user!"
          })
        } else {
          this.props.onAdd(data)
        }
      })
      .catch(err => {
        this.setState({
          'errorMsg': err.message
        })
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
    let name = formData.get('name')
    if (name === '') {
      this.setState({
        'errorMsg': 'Make sure to fill out the name field before hitting Add!'
      })
      return
    }
    let username = slug(name)

    formData.append('username', username)
    formData.append('autoCreated', true)

    authFetch('/api/user', {
      method: 'POST',
      body: formData
    })
    .then(resp => resp.json())
    .then(data => {
      this.props.onAdd([data])
    })
    .catch(err => {
      console.log(err.message)
      let msg = 'Error creating user'
      if (err.message === '400') {
        msg = 'A user with this name or email already exists'
      }
      this.setState({errorMsg: msg})
    })
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
      <div className='has-text-danger is-centered'>{this.state.errorMsg}</div>
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


class UpdateRotation extends React.Component {
  constructor(props) {
    super(props)
    const cycleDurationUnits = ['days', 'weeks', 'months']
    this.state = {
      'cycleDurationUnits': cycleDurationUnits,
      'cycleDurationUnit': cycleDurationUnits[0],
      'members': [],
      'cycleDuration': '',
      'cycleAmount': '',
      'nonPayingCycles': '',
      'membersPerCycle': '',
      'name': '',
      'errorMsg': '',
      'deleteModalClass': ''
    }
    this.onSelect = this.onSelect.bind(this)
    this.onAdd = this.onAdd.bind(this)
    this.onRemoveFactory = this.onRemoveFactory.bind(this)
    this.onInputChange = this.onInputChange.bind(this)
    this.onSaveClick = this.onSaveClick.bind(this)
    this.onStartClick = this.onStartClick.bind(this)
    this.onDeleteClick = this.onDeleteClick.bind(this)
    this.closeDeleteModal = this.closeDeleteModal.bind(this)
    this.openDeleteModal = this.openDeleteModal.bind(this)
  }

  componentDidMount(){
    // console.log(`UpdateRotation.componentDidMount`)
    this.setStateFromRotation(this.props.rotation)
  }

  componentDidUpdate(prevProps) {
    // console.log(`UpdateRotation.componentDidUpdate`)
    // console.log(`UpdateRotation: ${prevProps.rotation}, ${this.props.rotation}`)
    if (prevProps.rotation !== this.props.rotation) {
      this.setStateFromRotation(this.props.rotation)
    }
    // if (prevProps.)
  }

  setStateFromRotation (rotation) {
    const options = {
      'members': getDefault(rotation, 'members', []),
      'cycleDuration': getDefault(rotation, 'cycleDuration', ''),
      'cycleDurationUnit': getDefault(rotation, 'cycleDurationUnit', 'days'),
      'cycleAmount': getDefault(rotation, 'cycleAmount', ''),
      'cycleAmountCurrency': getDefault(rotation, 'cycleAmountCurrency', 'usd'),
      'nonPayingCycles': getDefault(rotation, 'nonPayingCycles', ''),
      'membersPerCycle': getDefault(rotation, 'membersPerCycle', ''),
      'name': getDefault(rotation, 'name', '')
    }

    return new Promise((resolve, reject) => {
      this.setState(options, resolve)
    })

  }

  onSaveClick () {
    this.save()
  }

  async save(options) {
    if (options === undefined) {
      options = {}
    }
    // console.log(`UpdateRotation.save: members.length=${this.state.members.length}`)
    const createUpdatePayload = Object.assign(options, {
      'memberIds': this.state.members.map(mem => mem.id),
      'cycleDuration': this.state.cycleDuration,
      'cycleDurationUnit': this.state.cycleDurationUnit.toLowerCase(),
      'cycleAmount': this.state.cycleAmount,
      'nonPayingCycles': this.state.nonPayingCycles,
      'membersPerCycle': this.state.membersPerCycle,
      'name': this.state.name
    })

    return updateRotation(this.props.rotation.id, createUpdatePayload)
      .then(resp => {
        if (! resp.ok) {
          this.setState({errorMsg: 'Error when updating rotation'})
        } else {
          return resp.json()
        }
      })
      .then(data => {this.setStateFromRotation(data); return data})
  }

  async onStartClick (evt) {
    console.log(`UpdateRotation.StartClick`)
    let data = await this.save({started: true, dateStarted: DateTime.local()})
    this.props.onChange(data)
  }

  onDeleteClick (evt) {
    // this.props.onDelete(this.props.rotation)
    deleteRotation(this.props.rotation.id)
      .then(resp => {
        if (! resp.ok) {
          this.setState({
            'errorMsg': `Error deleting rotation ${this.state.name}`
          })
        } else {
          this.props.onDelete(this.props.rotation)
        }
      })
    this.closeDeleteModal()
  }

  onSelect (evt) {
    let val = evt.target.value
    this.setState({
      'cycleDurationUnit': val
    })
  }

  onAdd (data) {
    if (data.length > 0) {
      const datum = data[0]
      const members = this.state.members
      const existingMember = members.find(mem => mem.id === datum.id)
      if (! existingMember) {
        members.push(datum)
        this.setState({
          'members': members
        }, () => {this.save()})
      } else {
        throw Error(`${datum.name} already in members list!`)
      }
    }
  }

  onRemoveFactory (member) {
    return (evt) => {
      const members = this.state.members
      const newMembers = members.filter(mem => mem.id !== member.id)
      this.setState({
        'members': newMembers
      }, () => {this.save()})
    }
  }

  onInputChange (evt) {
    let name = evt.target.name
    this.setState({
      [name]: evt.target.value
    })
  }

  closeDeleteModal () {
    this.setState({
      'deleteModalClass': ''
    })
  }

  openDeleteModal () {
    this.setState({
      'deleteModalClass': 'is-active'
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

    let titleText = `Update ${this.props.rotation.name}!`

    return (
      <div>
      <h4 className="title is-4">{titleText}</h4>
        <div className="columns">
          <div className="column is-one-quarter">
            <CreateUpdateRotationForm
              cycleDurationUnits={this.state.cycleDurationUnits}
              cycleDuration={this.state.cycleDuration}
              cycleAmount={this.state.cycleAmount}
              nonPayingCycles={this.state.nonPayingCycles}
              membersPerCycle={this.state.membersPerCycle}
              name={this.state.name}
              errorMsg={this.state.errorMsg}
              onInputChange={this.onInputChange}
              onSaveClick={this.onSaveClick}
              onStartClick={this.onStartClick}
              onDeleteClick={this.openDeleteModal}
            />
          </div>
          <div className="column is-one-half">
            <h5 className="title is-5">Members</h5>
            {memberDisplay}
            <AddMember onAdd={this.onAdd}/>
          </div>
        </div>
        <div className={`modal ${this.state.deleteModalClass}`}>
          <div className="modal-background" onClick={this.closeDeleteModal}></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Delete {this.state.name}</p>
              <button className="delete" aria-label="close" onClick={this.closeDeleteModal}></button>
            </header>
            <section className="modal-card-body">
              <div className="content">
                <p>Are you sure you want to delete this rotation?</p>
              </div>
            </section>
            <footer className="modal-card-foot">
              <button className="button is-danger" onClick={this.onDeleteClick}>Delete</button>
              <button className="button" onClick={this.closeDeleteModal}>Cancel</button>
            </footer>
          </div>
        </div>
      </div>
    )
  }
}

export default UpdateRotation
