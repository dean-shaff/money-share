import React from 'react'

const FormButton = (props) => {

  let internal = props.text
  if (props.children) {
    internal = props.children
  }
  let className = 'is-link'
  if (props.className) {
    className = props.className
  }

  return (
    <div className="field">
      <div className="control">
        <button onClick={props.onClick} className={`button is-fullwidth ${className}`}>{internal}</button>
      </div>
    </div>
  )
}

export default FormButton
