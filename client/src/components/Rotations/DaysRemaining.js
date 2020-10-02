import React from 'react'

import { LinkHighlight } from './../Highlight.js'


const DaysRemaining = ({daysRemaining}) => {
  let daysRemainingText = <p>There are <LinkHighlight text={daysRemaining}/> days left in this cycle</p>

  if (daysRemaining === 1) {
    daysRemainingText = <p>There is <LinkHighlight text={daysRemaining}/> day left in this cycle</p>

  } else if (daysRemaining === 0) {
    daysRemainingText = <p>This is the last day of the cycle!</p>
  }
  return daysRemainingText
}

export default DaysRemaining
