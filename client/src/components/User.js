import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faTimesCircle, faStopCircle } from '@fortawesome/free-solid-svg-icons'

import "./User.css"


const UserButtons = (props) => {

  console.log(`UserButtons: waiting=${props.waiting} paid=${props.paid}`)

  let buttonText = 'Mark as Paid'
  if (props.paid) {
    buttonText = 'Mark as Unpaid'
  }

  let loadingClass = ""
  if (props.waiting) {
    loadingClass = "is-loading"
  }

  const onClick = (evt) => {
    evt.stopPropagation()
    props.onClick(evt)
  }

  return (
    <div className="level">
      <div className="level-item">
        <button
          className={`button is-info is-outlined is-small ${loadingClass} is-fullwidth`}
          onClick={onClick}>
            {buttonText}
        </button>
      </div>
    </div>
  )
}


class User extends React.Component  {

  constructor(props) {
    super(props)
    // if (this.props.user.name === 'Dean Shaff') {
    //   console.log(`User.constructor: paid=${this.props.user.paid}`)
    // }
    this.state = {
      showButtons: false,
      waiting: false
    }
    this.onClick = this.onClick.bind(this)
    this.onToggleClick = this.onToggleClick.bind(this)
  }


  onClick (evt) {
    this.setState({showButtons: ! this.state.showButtons})
  }

  onToggleClick (evt) {
    this.props.onClick(this.props.user, ! this.props.user.paid)
    this.setState({waiting: true})
  }

  componentDidUpdate(prevProps) {
    // if (this.props.user.name === 'Dean Shaff') {
      // console.log(`User.componentDidUpdate: ${prevProps.user.paid}, ${this.props.user.paid}`)
    // }
    if (prevProps.user.paid !== this.props.user.paid) {
      this.setState({waiting: false})
    }
  }

  render () {
    // if (this.props.user.name === 'Dean Shaff') {
    //   console.log(`User.render: paid=${this.props.user.paid} waiting=${this.state.waiting}, showButtons=${this.state.showButtons}`)
    // }

    let isPaid = (
      <span className="icon is-right has-text-success">
        <FontAwesomeIcon icon={faCheckCircle}/>
      </span>
    )

    let userClass = 'user'

    if (! this.props.user.paid) {
      isPaid = (
        <span className="icon is-right has-text-danger">
          <FontAwesomeIcon icon={faTimesCircle}/>
        </span>
      )
    }
    if (this.props.user.nonPaying) {
      isPaid = (
        <span className="icon is-right">
          <FontAwesomeIcon icon={faStopCircle}/>
        </span>
      )
      userClass = ''
    }

    const emailPhoneContents = ['email', 'phone'].map(name => {
      let val = this.props.user[name]
      if (val !== '' && val !== undefined) {
        return <p key={name} className="title is-7">{val}</p>
      } else {
        return null
      }
    })

    let userButtons = null
    if (this.state.showButtons && ! this.props.user.nonPaying) {
      userButtons = <UserButtons paid={this.props.user.paid} waiting={this.state.waiting} onClick={this.onToggleClick} />
    }

    return (
      <div className={`${userClass} box`} onClick={this.onClick}>
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              {isPaid}
            </div>
            <div className="level-item">
              <div className="content small-spacing">
                <p className="title is-6">{this.props.user.name}</p>
                {emailPhoneContents}
              </div>
            </div>
          </div>
        </div>
        {userButtons}
      </div>
    )
  }
}

export default User
