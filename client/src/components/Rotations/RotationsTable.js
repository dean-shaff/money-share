import React from "react"
import { Link } from "react-router-dom";
import { DateTime } from 'luxon'

import settings from './../../settings.js'

const dateFormat = settings.dateFormat


const ManagedRotationsTable = (props) => {
  console.log('ManagedRotationsTable')
  const mapFactory = (rot, idx) => {
    return (rot, idx) => {
      const name = rot.name
      const onClick = props.onClickFactory(rot)
      let dateStartedText = null
      let membersLen = 0
      let membersPaid = null
      if (rot.started) {
        // toPath = `${props.match.url}/managedRotation/${rot.id}`
        dateStartedText = DateTime.fromISO(rot.dateStarted).toFormat(dateFormat)
        membersLen = rot.members.length
        let paidFiltered = rot.members.filter(mem => mem.paid)
        let nonPaying = rot.members.filter(mem => mem.nonPaying)
        membersPaid = `${paidFiltered.length}/${membersLen - nonPaying.length}`
      } else {
        // toPath = `${props.match.url}/managedRotation/${rot.id}/update`
        dateStartedText = 'Not Started'
        if (rot.members !== undefined) {
          membersLen = rot.members.length
        }
        membersPaid = '-'
      }

      return (
        <tr key={rot.id} onClick={onClick}>
          <td>{name}</td>
          <td>{dateStartedText}</td>
          <td>{membersPaid}</td>
        </tr>
      )
    }
  }

  return (
    <>
    <div className="title">{props.title}</div>
    <table className='table is-striped is-hoverable is-fullwidth'>
      <thead>
        <tr>
          <th>Name</th>
          <th>Date Started</th>
          <th># of Paid Members</th>
        </tr>
      </thead>
      <tbody>
        {props.rotations.map(mapFactory())}
      </tbody>
    </table>
    </>
  )
}

const MemberRotationsTable = (props) => {
  console.log(`MemberRotationsTable`)
  const mapFactory = (rot, idx) => {
    return (rot, idx) => {
      const name = rot.name
      const onClick = props.onClickFactory(rot)

      if (rot.started) {
        const user = rot.members.filter(mem => mem.id === props.userId)[0]
        let dueDateText = rot.nextCycleStartDate.toFormat(dateFormat)
        if (user.paid) {
          dueDateText = 'Already paid up!'
        }
        if (user.nonPaying) {
          dueDateText = 'Not paying this cycle!'
        }

        return (
          <tr key={rot.id} onClick={onClick}>
            <td>{name}</td>
            <td>${rot.cycleAmount}</td>
            <td>{dueDateText}</td>
          </tr>
        )
      } else {
        return null
      }
    }
  }

  return (
    <>
      <div className="title">{props.title}</div>
      <table className='table is-striped is-hoverable is-fullwidth'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount Due</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {props.rotations.map(mapFactory())}
        </tbody>
      </table>
    </>
  )
}

const RotationsTable = (props) => {
  console.log(`RotationTable: managedRotations.length=${props.managedRotations.length}, memberRotations.length=${props.memberRotations.length}`)
  let managed = null
  if (props.managedRotations.length > 0) {
    managed = (
      <ManagedRotationsTable
        title={"Rotations you manage"}
        rotations={props.managedRotations}
        onClickFactory={props.onClickFactory}
        match={props.match}/>
    )
  }

  let member = null
  if (props.memberRotations.length > 0) {
    member = (
      <MemberRotationsTable
        userId={props.userId}
        title={"Rotations you're a member of"}
        rotations={props.memberRotations}
        onClickFactory={props.onClickFactory}
        match={props.match}/>
    )
  }

  let table = null
  if (managed !== null || member !== null) {
    table = (
      <>
        {managed}
        {member}
      </>
    )
  }
  return table
}

export default RotationsTable
