import React from "react"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import LoginRegisterContainer from "./LoginRegisterContainer.js"


const InputField = (props) => {
  let propsCopy = Object.assign({}, props)
  let className = "control"
  let iconElem = null
  if (propsCopy.icon) {
    className = "control has-icons-left"
    iconElem = (
      <span className="icon is-small is-left">
        <FontAwesomeIcon icon={propsCopy.icon} />
      </span>
    )
    delete propsCopy.icon
  }
  
  let labelElem = null
  if (propsCopy.label) {
    labelElem=<label className="label">{propsCopy.label}</label>
    delete propsCopy.label
  }

  let inputClassName = 'input'
  if (propsCopy.inputClassName) {
    inputClassName = `${inputClassName} ${propsCopy.inputClassName}`
    delete propsCopy.inputClassName
  }

  let divClassName = 'field'
  let children = null

  if (propsCopy.children !== undefined) {
    divClassName = 'field has-addons'
    children = propsCopy.children
    delete propsCopy.children
  }

  return (
    <div className={divClassName}>
      {labelElem}
      <div className={className}>
        <input className={inputClassName} {...propsCopy}/>
        {iconElem}
      </div>
      {children}
    </div>
  )
}


export default InputField
