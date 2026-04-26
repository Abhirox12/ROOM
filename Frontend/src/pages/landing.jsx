import React, { useState } from 'react'

import Buttonsbox from '../contents/buttonsbox'
import Login from './login'
import Guestmeeting from './guestmeeting'
// import "../App.css";

export default function Landingpage() {
  const [ldisplay, lsetDisplay] = useState(false)
  const [gdisplay, gsetDisplay] = useState(false)
  const [display, setdisplay] = useState(false)


  const isblur = () => {
    if (ldisplay === true || gdisplay === true) {
      return "block"
    }
  }


  const gueststyle = {
    display: gdisplay ? "flex" : "none"
  }
  const loginstyle = {
    display: ldisplay ? "flex" : "none"
  }

let hide=()=>{
  lsetDisplay(false);
  gsetDisplay(false);
}


  let loginshow = () => {
    lsetDisplay(!ldisplay)
    isblur()

  }
  let guestshow = () => {
    gsetDisplay(!gdisplay)
    isblur()
  }
  let switchguestlogin = () => {
    lsetDisplay(!ldisplay);
    gsetDisplay(!gdisplay)

  }



  return (

    <div className='landingPage'>
      <div className="landingstyle" style={{display:isblur()}}>
      </div>

      <Guestmeeting style={gueststyle} switchlogin={switchguestlogin} display={hide}/>
      <Login style={loginstyle} switchguest={switchguestlogin} displayer={hide} />
      <div className="landingPageContainer">
        <div className="landingPageText">
          {/* <h1>Welcome to Room</h1> */}
          <h1>Connect to Anyone, Anywhere</h1>
          <p>Chat with people across the world just like you are in same ROOM</p>
        </div>
        <Buttonsbox guest={guestshow} login={loginshow} />
        <img src="../vcimage.png" alt="" className='vcimage' />
      </div>
    </div>
  )
}
