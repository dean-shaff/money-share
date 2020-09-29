import React from 'react'
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'

import './RotationsNavigation.css'


const RotationsNavigation = (props) => {
  const filteredRotations = props.rotations.filter(rot => rot.id !== props.rotation.id)
  const basePath = filteredRotations[0].managed ? '/rotations/managedRotation' : '/rotations/memberRotation'

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
      <div className="navbar-menu is-active">
        <div className="navbar-start">
          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">
              <span className="title is-4">
                {props.rotation.name}
              </span>
            </a>
            <div className="navbar-dropdown">
              {filteredRotations.map(rot => (
                <Link key={rot.id} className="navbar-item" to={`${basePath}/${rot.id}`}>
                  <span className="subtitle">{rot.name}</span>
                </Link>
              ))}
            </div>
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
