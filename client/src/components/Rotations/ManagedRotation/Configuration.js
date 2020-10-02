import React, {useState} from "react"

import { DateTime } from 'luxon'
import DeleteModal from './DeleteModal.js'
import { LinkHighlight } from './../../Highlight.js'

import { deleteRotation, updateRotation } from './../../../util.js'

const Configuration = (props) => {

  const [deleteVisible, setDeleteVisible] = useState(false)
  const [stopVisible, setStopVisible] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const rotation = props.rotation
  const totalCycles = rotation.totalCycles
  const nonPayingMembers = rotation.nonPayingCycles * rotation.membersPerCycle

  let cycleDurationUnit = rotation.cycleDurationUnit
  if (rotation.cycleDuration === 1) {
    cycleDurationUnit = cycleDurationUnit.slice(0, -1)
  }

  const startDate = DateTime.fromISO(rotation.dateStarted)
  const startDateFormatted = startDate.toFormat('DDDD')

  const onDelete = () => {
    console.log('Configuration.deleteRotation')
    deleteRotation(rotation.id)
      .then(resp => {
        props.onDelete(rotation)
      })
      .catch(err => {
        setErrorMsg(err.message)
      })
    setDeleteVisible(false)
  }

  const onStop = () => {
    console.log(`Configuration.stopRotation`)
    let options = {
      'memberIds': rotation.members.map(mem => mem.id),
      'started': false,
      'dateStarted': null
    }
    updateRotation(rotation.id, options)
      .then(resp => resp.json())
      .then(data => {
        props.onChange(data)
      })
      .catch(err => {
        setErrorMsg(err.message)
      })
    setStopVisible(false)
  }

  return (
    <div>
    <div className="content is-large">
      <p className="title">Rotation Name: <LinkHighlight text={rotation.name}/></p>
      <p className="title">Rotation Start Date: <LinkHighlight text={startDateFormatted}/></p>
      <p className="title">Cycle Duration: <LinkHighlight text={rotation.cycleDuration}/> {cycleDurationUnit}</p>
      <p className="title">Cycle Amount: <LinkHighlight text={`$${rotation.cycleAmount}`}/></p>
      <p className="title">Number of members getting paid per cycle: <LinkHighlight text={rotation.membersPerCycle}/></p>
      <p className="title">Nonpaying Members per cycle: <LinkHighlight text={nonPayingMembers}/></p>
      <p className="title">Number of Cycles per Rotation: <LinkHighlight text={totalCycles}/></p>
      <div className="field is-grouped">
        <div className="control">
          <button className="button is-warning" onClick={() => {setStopVisible(true)}}>Stop Rotation</button>
        </div>
        <div className="control">
          <button className="button is-danger" onClick={() => {setDeleteVisible(true)}}>Delete Rotation</button>
        </div>
      </div>
      <div>
        <p className="has-text-danger">{errorMsg}</p>
      </div>
    </div>
    <DeleteModal
      visible={deleteVisible}
      onClose={() => {setDeleteVisible(false)}}
      onTrigger={onDelete}
      buttonText={"Delete"}
      title={`Delete ${rotation.name}`}>
      <p>Are you sure you want to delete this rotation?</p>
    </DeleteModal>

    <DeleteModal
      visible={stopVisible}
      onClose={() => {setStopVisible(false)}}
      onTrigger={onStop}
      buttonText={"Stop"}
      title={`Stop ${rotation.name}`}>
      <p>Are you sure you want to stop this rotation?</p>
    </DeleteModal>

    </div>
  )
}

export default Configuration
