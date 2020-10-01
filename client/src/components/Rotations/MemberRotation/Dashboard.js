import React from 'react'
import { DateTime } from 'luxon'

import { LinkHighlight } from './../../Highlight.js'
import { getTokenUserInfo, stringify } from './../../../util.js'
import { dateFormat } from './../../../settings.js'


class Dashboard extends React.Component {
  constructor(props) {
    super(props)
  }

  findUser(rotation){
    const tokenUserInfo = getTokenUserInfo()
    let user = rotation.members.find(mem => mem.id === tokenUserInfo.id)
    return user
  }

  componentDidMount() {
    // console.log(`Dashboard.componentDidMount: ${stringify(this.props.match)}`)
    this.props.onSetCurrentRotation(this.props.rotation)
  }

  render () {
    const rotation = this.props.rotation
    const user = this.findUser(rotation)

    // let managerText = <p></p>

    let receivingPaymentText = <p>You're not receiving payment this cycle</p>
    if (user.receivingPayment) {
      const payingMembers = rotation.members.length - (rotation.nonPayingCycles*rotation.membersPerCycle)
      const paymentAmount = (payingMembers*rotation.cycleAmount)/rotation.membersPerCycle
      const payoutDate = rotation.cycleEndDate
      receivingPaymentText = (
        <p>You'll be receiving <LinkHighlight text={`$${paymentAmount}`}/> on <LinkHighlight text={payoutDate.toFormat(dateFormat)}/></p>
      )
    }

    let paidText = <p>Looks like you've yet to pay this cycle</p>
    if (user.paid) {
      const notes = user.CycleNotes.filter(note => note.rotationId === rotation.id)
      const mostRecent = notes[notes.length - 1]
      const datePaid = DateTime.fromISO(mostRecent.datePaid)
      paidText = (
        <>
        <p>You're all paid up for this cycle</p>
        <p>You paid <LinkHighlight text={`$${mostRecent.amountPaid}`}/> on <LinkHighlight text={datePaid.toFormat(dateFormat)}/></p>
        </>
      )
    }
    if (user.nonPaying) {
      paidText = <p>Lucky you, you don't have to pay this cycle!</p>
    }

    return (
      <div className="content is-large">
        <p className="title">Hi {user.name}!</p>
        {paidText}
        {receivingPaymentText}
        <p>
          There are <LinkHighlight text={rotation.daysRemaining}/> days left in this cycle
        </p>
      </div>
    )
  }

}

export default Dashboard
