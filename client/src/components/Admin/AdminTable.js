import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'


const AdminTable = (props) => {

  const { labels, getRow, data, title, subDomain } = props

  const location = useLocation()
  const history = useHistory()

  const onClick = (datum) => {
    return (evt) => {
      evt.preventDefault()
      history.push(`/admin/${subDomain}/${datum.id}`)
    }
  }

  const rows = data.map(datum => {
    const vals = getRow(datum)
    return (
      <tr key={datum.id} onClick={onClick(datum)}>
        {vals.map((v, idx) => (<td key={`${datum.id}-${idx}`}>{v}</td>))}
      </tr>
    )
  })

  return (
    <>
      <div className="title">{title}</div>
      <table className='table is-striped is-hoverable is-fullwidth'>
        <thead>
          <tr>
            {labels.map(l => (<th key={l}>{l}</th>))}
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </>
  )
}

export default AdminTable
