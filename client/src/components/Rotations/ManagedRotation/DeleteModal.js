import React from 'react'

const DeleteModal = (props) => {

  let deleteModalClass = ''
  if (props.visible) {
    deleteModalClass = 'is-active'
  }

  return (
    <div className={`modal ${deleteModalClass}`}>
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
          <button className="button is-danger" onClick={props.onTrigger}>{props.buttonText}</button>
          <button className="button" onClick={props.onClose}>Cancel</button>
        </footer>
      </div>
    </div>
  )
}

export default DeleteModal
