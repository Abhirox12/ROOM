import React, { useContext, useState } from 'react'
import { AuthContext } from '../../context/authcontext'
import { useNavigate } from 'react-router-dom'
export default function Guestmeeting({ style, switchButton, display, token, create }) {
  const [meetingCode, setMeetingCode] = useState("")
  let routeto = useNavigate()
  const { guestUserMeeting } = useContext(AuthContext)
  let joiningMeeting = async (e) => {
    try {
      e.preventDefault()
      console.log("checking guest connection")
      let result = await guestUserMeeting(meetingCode)
      console.log(result)
      routeto(`/${meetingCode}`)
    } catch (error) {

    }

  }

  return (
    <div className='guest' style={style}>
      <div className="cross" onClick={display}>x</div>
      <div className='guestbox'>


        <h1 style={{ color: "purple" }}>
          Join Room
        </h1>
        <div className="guestform">
          <form action="">
            <label htmlFor="meetingCode">Meeting Code</label> <br />
            <input type="text" id='meetingCode' name='meetingCode' value={meetingCode}
              onChange={(e) => { setMeetingCode(e.target.value) }} />
            <br />
            <button className='join' onClick={joiningMeeting} >
              Join Room
            </button>

          </form>
          <button className='switch-to-login' onClick={switchButton}>
            {token ? create ? "Join Room" : "Create Room" : "Login/Signup"}


          </button>
        </div>
      </div>
    </div>
  )
}
