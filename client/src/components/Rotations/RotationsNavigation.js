import React from 'react'
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'

import useHamburgerToggle from './../../hooks/useHamburgerToggle.js'
import './RotationsNavigation.css'


const RotationsNavigation = (props) => {

  const [onHamburgerClick, className] = useHamburgerToggle()

  const filteredRotations = props.rotations.filter(rot => rot.id !== props.rotation.id)
  const basePath = props.rotation.managed ? '/rotations/managedRotation' : '/rotations/memberRotation'

  let dropDownContents = null
  if (filteredRotations.length > 0) {
    dropDownContents = (
      <div className="navbar-dropdown">
        {filteredRotations.map(rot => (
          <Link key={rot.id} className="navbar-item" to={`${basePath}/${rot.id}`}>
            <span className="subtitle">{rot.name}</span>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <>
    {/*<nav className="breadcrumb navbar is-spaced" aria-label="rotations navigation">
      <ul>
        <li>
          <Link to={'/rotations'} className="navbar-item">
            <span className="icon is-small">
              <FontAwesomeIcon icon={faHome} size="lg"/>
            </span>
            <span>Rotations</span>
          </Link>
        </li>
        <li>
          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">
              {props.rotation.name}
            </a>
            <div className="navbar-dropdown">
              {filteredRotations.map(rot => (
                <Link key={rot.id} className="navbar-item" to={`${basePath}/${rot.id}`}>{rot.name}</Link>
              ))}
            </div>
          </div>
        </li>
      </ul>
    </nav>*/}
    <div className="container">
    <nav className="navbar has-separator is-spaced left-justify is-below">
      <div className="navbar-brand">
        <Link to={'/rotations'} className="navbar-item">
          <span>
          <span className="icon is-small">
            <FontAwesomeIcon icon={faHome} size="lg"/>
          </span>
          <span className="title is-4">Rotations</span>
          </span>
        </Link>
      </div>
      <div className="navbar-menu no-box-shadow is-active">
        <div className="navbar-start">
          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">
              <span className="title is-4">
                {props.rotation.name}
              </span>
            </a>
            {dropDownContents}
          </div>
        </div>
      </div>
    </nav>
      {props.children}
    </div>
    </>
  )
}

export default RotationsNavigation
