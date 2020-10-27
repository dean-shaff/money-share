import React, { useState, useEffect } from 'react'

const Modal = (props) => {

  const modalClass = props.visible ? 'is-active' : ''
  const triggerClass = props.triggerClass ? props.triggerClass : 'is-danger'


  return (
    <div className={`modal ${modalClass}`}>
      <div className="modal-background" onClick={props.onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">{props.title}</p>
          <button className="delete" aria-label="close" onClick={props.onClose}></button>
        </header>
        <section className="modal-card-body">
          <div className="content">
            {props.children}
          </div>
        </section>
        <footer className="modal-card-foot">
          <button className={`button ${triggerClass}`} onClick={props.onTrigger}>{props.buttonText}</button>
          <button className="button" onClick={props.onClose}>Cancel</button>
        </footer>
      </div>
    </div>
  )
}

export default Modal
