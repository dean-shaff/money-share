import React from "react"
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faSort } from '@fortawesome/free-solid-svg-icons'


const dateFormat = "MMMM Do, YYYY"


class Dashboard extends React.Component {

  constructor(props) {
    super(props)
  }

  calcDaysRemaining (dateStarted, cycleDuration)  {
    let dateStartedObj = moment(dateStarted, dateFormat)
    // console.log(`dateStartedObj=${dateStartedObj}`)
    let nextCycle = dateStartedObj.add(cycleDuration, 'days')
    // console.log(`nextCycle=${nextCycle}`)
    let today = moment()
    let delta = nextCycle.diff(today, 'days')
    // console.log(`delta=${delta}`)
    return delta
  }


  render () {
    const rotation = this.props.rotation
    console.log(`Dashboard.render: rotation=${JSON.stringify(rotation, null, 2)}`)
    if (rotation === null) {
      return null
    }

    if (rotation.started === null || ! rotation.started) {
      return (
        <div>
          <button className="button is-primary" onClick={this.props.onStart}>Start Rotation!</button>
        </div>
      )
    } else {
      let daysRemaining = this.calcDaysRemaining(
        rotation.dateStarted, rotation.cycleDuration)
      return (
        <div className="columns">
          <div className="column is-one-third">
            <div className="box">
              <h4 className="title is-4">
                <span className="days-remaining">{daysRemaining}</span> days left in cycle
              </h4>
            </div>
            <div className="box">
              <p>This Cycle's Recipients</p>
            </div>
          </div>
          <div className="column is-two-thirds">
            <div className="box">
              <nav className="navbar has-shadow">
                <div className="navbar-menu">
                  <div className="navbar-item">
                    <h4 className="title is-4">Activity</h4>
                  </div>
                </div>
                <div className="navbar-end">
                  <div className="navbar-item">
                  <p className="control has-icons-left">
                    <input className="input is-rounded is-small" type="text" placeholder="Search"/>
                    <span className="icon is-left">
                      <FontAwesomeIcon icon={faSearch}/>
                    </span>
                  </p>
                  </div>
                  <div className="navbar-item">
                    <span className="icon">
                      <FontAwesomeIcon icon={faSort}/>
                    </span>
                  </div>
                </div>
              </nav>

            </div>
          </div>
        </div>
      )
    }
  }
}

export default Dashboard
