import React from 'react'

import { getTokenUserInfo } from './../../../util.js'


class Dashboard extends React.Component {
  constructor(props) {
    super(props)
  }

  findUser(rotation){
    const tokenUserInfo = getTokenUserInfo()
    let user = rotation.members.find(mem => mem.id === tokenUserInfo.id)
    return user
  }

  render () {
    const rotation = this.props.rotation
    const user = this.findUser(rotation)

    let receivingPaymentText = "You're not receiving payment this cycle"
    if (user.receivingPayment) {
      receivingPaymentText = "You're receiving payment this cycle"
    }

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
        <p>{receivingPaymentText}</p>
        <p>
          There are <span className="has-text-primary">{this.props.daysRemaining}</span> days left in this cycle
        </p>
      </div>
    )
  }

}

export default Dashboard
