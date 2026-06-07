import React, { useState } from 'react'
import AuthError from './AuthError'
import Buttonsbox from '../contents/buttonsbox'
import Login from './Login'
import Guestmeeting from './guestmeeting'
import Error from './error'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

// import "../App.css";

export default function Landingpage() {
  const location = useLocation()
  const ifFrom = location.state?.from
  const [ldisplay, lsetDisplay] = useState(false)
  const [gdisplay, gsetDisplay] = useState(false)
  const navigate = useNavigate()
  const [ErrorDisplay, setErrorDisplay] = useState(false)
  const [intro, setIntro] = useState(true)
  const [errorText, setErrorText] = useState("")
  const [codeErrorDisplay, setCodeErrorDisplay] = useState(ifFrom ? true : false)
  const [connected, setConnected] = useState(true)

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/health`
        );

        if (res.ok) {
          setConnected(false);

          setTimeout(() => {
            setIntro(false);
          }, 2000);

          return true;
        }
      } catch (err) {
        console.log(err);
      }

      return false;
    };

    checkServer();

    const interval = setInterval(async () => {
      const success = await checkServer();

      if (success) {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (ifFrom) {
      navigate('/', { replace: true, state: null })
    }
  }, [])
  const isblur = () => {
    if (ldisplay === true || gdisplay === true || codeErrorDisplay === true) {
      return "block"
    }
  }
  const isAuthBlur = () => {
    if (ErrorDisplay === true) {
      return "block"
    }
  }

  const gueststyle = {
    display: gdisplay ? "flex" : "none"
  }
  const loginstyle = {
    display: ldisplay ? "flex" : "none"
  }
  const errorstyle = {
    display: codeErrorDisplay ? "flex" : "none"
  }

  let hide = () => {
    lsetDisplay(false);
    gsetDisplay(false);
  }
  let errorHide = () => {
    setCodeErrorDisplay(false)
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
  const authErrorStyle = {
    display: ErrorDisplay ? "flex" : "none"
  }
  const authErrorHide = () => {
    setErrorDisplay(false)
  }



  return (

    <div className='landingPage'>
      <img src="../images/Logo.png" alt="" className='Logo' />
      <div className="landingstyle" style={{ display: isblur() }}>
      </div>
      <div className="landingstyle1" style={{ display: isAuthBlur() }}>
      </div>
      <div className='serverLoader' style={{ display: intro ? "flex" : "none" }}>
        {connected ? (
          <>
            <p>
              Connecting to server...
              The backend may take up to 60 seconds to wake up.
              Thanks for Waiting
            </p>
            <div>
              <div className="spinner"></div>
            </div>
          </>

        ) : (
          <>
            <p>🟢 Server connected</p>
        
          </>

        )
        }
      </div>
      <AuthError style={authErrorStyle} errorText={errorText} display={authErrorHide} />
      <Error display={errorHide} style={errorstyle} />
      <Guestmeeting style={gueststyle} switchButton={switchguestlogin} display={hide} setErrorText={setErrorText} setErrorDisplay={setErrorDisplay} />
      <Login style={loginstyle} setErrorText={setErrorText} setErrorDisplay={setErrorDisplay} switchguest={switchguestlogin} displayer={hide} />
      <div className="landingPageContainer">
        <div className="landingPageText">
          {/* <h1>Welcome to Room</h1> */}
          <h1>Connect to Anyone, Anywhere</h1>
          <p>Chat with people across the world just like you are in same <img src="../images/Room.png" alt="ROOM" width="80px" className='room-text' /></p>
        </div>
        <Buttonsbox guest={guestshow} login={loginshow} />
        <img src="../images/vcimage.png" alt="" className='vcimage' />
      </div>
    </div>
  )
}
