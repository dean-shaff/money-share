import React from 'react'

export const PrimaryHighlight = ({text}) => {
  return <span className="has-text-primary">{text}</span>
}

export const LinkHighlight = ({text}) => {
  return <span className="has-text-link">{text}</span>
}

export const WarningHighlight = ({text}) => {
  return <span className="has-text-warning">{text}</span>
}

export const DangerHighlight = ({text}) => {
  return <span className="has-text-danger">{text}</span>
}
