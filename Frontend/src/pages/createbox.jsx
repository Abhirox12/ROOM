import React, { useContext, useState } from 'react'
import { AuthContext } from '../../context/authcontext'
import { useNavigate } from 'react-router-dom'


export default function createbox({ style,meetingCode }) {
    const { handleCreateMeeting } = useContext(AuthContext)
    let router = useNavigate()
  
  let createMeeting = async (e) => {
    
    router(`/${meetingCode}?type=create`)
  }


  return (
    <div className={style}>
      <div>

        <h1>Create Room</h1>
        <div>

          <p>Your meeting code is: ${meetingCode} </p>
          <button className='creating-room' onClick={createMeeting}>Create Room</button>
          <button className='switch-to-join'>Join Room</button>
        </div>
      </div>
    </div>
  )
}
