import React from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'

const AdminTableBase = (props) => {

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
      {props.title}
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

export const AdminTable = (props) => {
  let { title, ...rest } = props
  title = (
    <div className="title">{props.title}</div>
  )
  return <AdminTableBase title={title} {...rest}/>
}

export const AdminTableWithNew = (props) => {
  let { title, ...rest } = props
  title = (
    <div className="columns">
      <div className="column">
        <div className="title">{props.title}</div>
      </div>
      <div className="column is-narrow">
        <Link className="button is-primary" to={`/admin/${props.subDomain}/create`}>New</Link>
      </div>
    </div>
  )
  return <AdminTableBase title={title} {...rest}/>
}
