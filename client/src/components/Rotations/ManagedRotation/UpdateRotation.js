import React, { useState } from "react"
import qs from 'qs'
import { faUser, faTimesCircle, faChevronDown, faChevronUp, faAt, faPhone } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DateTime } from 'luxon'
import slug from 'slug'

import InputField from './../../InputField.js'
import CreateUpdateRotationForm from "./CreateUpdateRotationForm"
import DeleteModal from './DeleteModal.js'
import {
  authFetch,
  getDefault,
  getTokenUserInfo,
  createRotation,
  updateRotation,
  deleteRotation,
  cleanPhone
} from "./../../../util.js"

import "./UpdateRotation.css"
import "./../../User.css"



const ManualEntry = (props) => {

  return (
    <div>
      <form onSubmit={props.onSubmit}>
      <InputField type="text" name="name" placeholder="Name" icon={faUser}></InputField>
      {/*<InputField type="text" name="username" placeholder="Username" icon={faUser}></InputField>*/}
      <InputField type="email" name="email" placeholder="Email" icon={faAt}></InputField>
      <InputField type="tel" name="phone" placeholder="Phone Number" icon={faPhone}></InputField>
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
    this.onSearchKeyPress = this.onSearchKeyPress.bind(this)
    this.onToggleManualEntry = this.onToggleManualEntry.bind(this)
    this.onManualEntrySubmit = this.onManualEntrySubmit.bind(this)
  }

  onClick (evt) {
    this.search()
  }

  search () {
    let queryObj = {}
    let searchType = this.state.searchType.toLowerCase()
    queryObj[searchType] = this.state.searchText
    const query = qs.stringify(queryObj)
    console.log(`onClick: ${query}`)
    authFetch(`/api/user/?${query}`)
      .then(resp => resp.json())
      .then(data => {
        if (data.length === 0) {
          this.setState({
            'errorMsg': `Couldn't find user with ${searchType} ${this.state.searchText}`
          })
        } else {
          this.props.onAdd(data)
          this.setState({'errorMsg': ''})
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

  onSearchKeyPress (evt) {
    if (evt.key === 'Enter') {
      this.search()
    }
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
    let phone = cleanPhone(formData.get('phone'))
    if (phone.length !== 10) {
      this.setState({
        'errorMsg': 'Make sure to include area code in phone number'
      })
      return
    }

    let email = formData.get('email')

    if (phone === '' && email === '') {
      this.setState({
        'errorMsg': 'Make sure to provide either an email address or phone number before hitting Add!'
      })
      return
    }
    if (phone !== '' && phone.length !== 10) {
      this.setState({
        'errorMsg': 'Make sure to provide full 10 digit phone number!'
      })
      return
    }


    // let username = slug(name)
    // formData.append('username', username)
    formData.append('autoCreated', true)

    authFetch('/api/user', {
      method: 'POST',
      body: formData
    })
    .then(resp => resp.json())
    .then(data => {
      this.props.onAdd([data])
      this.setState({'errorMsg': ''})
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
          <InputField type="text" name="name" value={this.state.searchText} onKeyPress={this.onSearchKeyPress} onChange={this.onSearchType} placeholder="Search" icon={faUser}></InputField>
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

// const MemberTable = (props) => {
//   const members = props.members
//
//   return (
//     <div className="table-container">
//       <table className="table">
//         <thead>
//          <tr>
//            <th><abbr title="Position">Pos</abbr></th>
//            <th>Username</th>
//            <th>Name</th>
//            <th></th>
//          </tr>
//         </thead>
//         <tbody>
//           {members.map((mem, idx) => (
//             <tr key={mem.id}>
//               <td>{idx + 1}</td>
//               <td>{mem.username}</td>
//               <td>{mem.name}</td>
//               <td>
//                 <span className="icon is-small is-left has-text-danger" onClick={props.onRemoveFactory(mem)}>
//                   <FontAwesomeIcon icon={faTimesCircle} />
//                 </span>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   )
// }

const Member = (props) => {
  const emailPhoneContents = ['email', 'phone'].map(name => {
    let val = props.user[name]
    if (val !== '' && val !== undefined) {
      return <p key={name} className="title is-7">{val}</p>
    } else {
      return null
    }
  })

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
            <div className="content small-spacing">
              <p className="title is-6">{props.user.name}</p>
              {emailPhoneContents}
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
              <Member user={mem} onRemoveFactory={onRemoveFactory}/>
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
      'deleteModalVisible': false
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
    this.props.onSetCurrentRotation(this.props.rotation)
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
    let nMembers = this.state.members.length
    if (nMembers === 0) {
      this.setState({errorMsg: 'Need at least one member to start the rotation!'})
    } else {
      let membersPerCycle = this.state.membersPerCycle
      if (nMembers % membersPerCycle !== 0) {
        this.setState({errorMsg: 'Number of members in rotation needs to be an integer multiple of members per cycle'})
      } else {
        let data = await this.save({started: true, dateStarted: DateTime.local()})
        this.props.onChange(data)
      }
    }
  }

  onDeleteClick (evt) {
    // this.props.onDelete(this.props.rotation)
    deleteRotation(this.props.rotation.id)
      .then(resp => {
        this.props.onDelete(this.props.rotation)
      })
      .catch(err => {
        this.setState({
          'errorMsg': err.message
        })
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
      'deleteModalVisible': false
    })
  }

  openDeleteModal () {
    this.setState({
      'deleteModalVisible': true
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
      {/*<h4 className="title is-4">{titleText}</h4>*/}
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
            <p className="label">Members</p>
            {memberDisplay}
            <AddMember onAdd={this.onAdd}/>
          </div>
        </div>
        <DeleteModal
          visible={this.state.deleteModalVisible}
          onClose={this.closeDeleteModal}
          onTrigger={this.onDeleteClick}
          buttonText={"Delete"}
          title={`Delete ${this.state.name}`}>
          <p>Are you sure you want to delete this rotation?</p>
        </DeleteModal>
      </div>
    )
  }
}

export default UpdateRotation
