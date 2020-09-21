import React from 'react'

import { getTokenUserInfo } from './../../../util.js'


class Dashboard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: this.findUser(this.props.rotation)
    }
  }

  findUser(rotation){
    const tokenUserInfo = getTokenUserInfo()
    let user = null
    for (let idx=0; idx<rotation.members.length; idx++) {
      let member = rotation.members[idx]
      if (tokenUserInfo.id === member.id) {
        user = member
        break
      }
    }
    return user
  }

  render () {
    const rotation = this.props.rotation
    const user = this.state.user
    let paidText = "You're all paid up for this cycle!"
    if (! user.paid) {
      paidText = "Looks like you've yet to pay this cycle"
    }
    if (user.nonPaying) {
      paidText = "Lucky you, you don't have to pay this cycle!"
    }

    return (
      <div className="content is-large">
        <p className="title">Hi {user.name}!</p>
        <p>{paidText}</p>
        <p>
          There are <BlueHighlight text={this.props.daysRemaining}/> days left in this cycle
        </p>
      </div>
    )
  }

}

export default Dashboard
