import React, { useContext, useState } from 'react'
import { AuthContext } from '../../context/authcontext'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
export default function Guestmeeting({ style, switchButton, display, token, create, setErrorDisplay, setErrorText, setJoinMeet }) {
  const [meetingCode, setMeetingCode] = useState("")
  let routeto = useNavigate()
  const { checkMeeting, guestUserMeeting } = useContext(AuthContext)
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isCreating = searchParams.get('type') === 'create';
  let joiningMeeting = async (e) => {
    try {
      e.preventDefault()
      if (!meetingCode) {
        let result = "please enter meeting Code"
        setErrorDisplay(true)
        setErrorText(result)
        setJoinMeet(true)
        return
      }
      if (!token && !isCreating) {
        const result = await guestUserMeeting(meetingCode)
        if (result !== "Joining meeting") {
          setErrorDisplay(true)
          setErrorText(result)
        }
      }
      const exists = await checkMeeting(meetingCode)
      if (exists) {
        setErrorDisplay(false)
        routeto(`/${meetingCode}`)
        
      } else {
        setErrorDisplay(true)
        setJoinMeet(false)
      }
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
