import React from 'react'

export default function Guestmeeting({ style, switchButton, display, token, create }) {



  return (
    <div className='guest' style={style}>
      <div className="cross" onClick={display}>x</div>
      <h1 style={{ color: "purple" }}>
        {create ? "Create Room" : "Join Room"}
      </h1>
      <div className="guestform">
        <form action="">
          {/* <label htmlFor="name">Name</label> <br />
          <input type="text" id='name' name='name' /><br /> */}
          <label htmlFor="meetingCode">Meeting Code</label> <br />
          <input type="text" id='meetingCode' name='meetingCode' />
          <br />

          {create ?
            <button className='join'>
              Create Room
            </button>
              :
              <button className='join'>

              Join Room
            </button>
          }
        </form>
        <button className='switch-to-login' onClick={switchButton}>
          {token ? create ? "Join Room" : "Create Room" : "Login/Signup"}


        </button>
      </div>
    </div>
  )
}
