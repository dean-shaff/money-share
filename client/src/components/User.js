import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'

import "./User.css"


const UserButtons = (props) => {

  console.log(`UserButtons: ${props.waiting}`)

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
    <div className="buttons">
      <div className="level">
        <div className="level-item">
          <button
            className={`button is-info is-outlined is-small ${loadingClass}`}
            onClick={onClick}>
              {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}


class User extends React.Component  {

  constructor(props) {
    super(props)
    if (this.props.name === 'Dean Shaff') {
      console.log(`User.constructor`)
    }

    this.state = {
      computedPaid: this.props.user.paid,
      showButtons: false,
      waiting: false
    }
    this.onClick = this.onClick.bind(this)
    this.onToggleClick = this.onToggleClick.bind(this)
  }


  onClick (evt) {
    evt.stopPropagation()
    this.setState({showButtons: ! this.state.showButtons})
  }

  onToggleClick (evt) {
    this.props.onClick(evt, this.props.user, ! this.state.computedPaid)
    this.setState({waiting: true})
    // setComputedPaid(! computedPaid)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user.paid !== this.props.user.paid) {
      this.setState({waiting: false})
    }
  }

  render () {
    if (this.props.user.name === 'Dean Shaff') {
      console.log(`User.render: waiting=${this.state.waiting}, showButtons=${this.state.showButtons}`)
    }

    let isPaid = (
      <span className="icon is-right has-text-success">
        <FontAwesomeIcon icon={faCheckCircle}/>
      </span>
    )
    if (! this.state.computedPaid) {
      isPaid = (
        <span className="icon is-right has-text-danger">
          <FontAwesomeIcon icon={faTimesCircle}/>
        </span>
      )
    }
    let userButtons = null
    if (this.state.showButtons) {
      userButtons = <UserButtons paid={this.state.computedPaid} waiting={this.state.waiting} onClick={this.onToggleClick} />
    }

    return (
      <div className="user box" onClick={this.onClick}>
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              {isPaid}
            </div>
            <div className="level-item">
              <div className="content">
                <p className="title is-7">{this.props.user.name}</p>
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
