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

  return (
    <div className="field">
      <div className={className}>
        <input className="input" {...propsCopy}></input>
        {iconElem}
      </div>
    </div>
  )
}


export default InputField
