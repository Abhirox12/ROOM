import React, { useContext, useState,useEffect } from 'react'
// import withAuth from '../../utilities/authguard'
import styles from "../Css files/home.module.css"
import { jwtDecode } from "jwt-decode"
import JoinMeeting from './guestmeeting'
import Error from './error'
import CreateMeeting from './Createbox'
import { v4 as uuidv4 } from 'uuid'
import { useLocation, useNavigate } from 'react-router-dom'




function Home() {
    let location = useLocation()
    const ifFrom = location.state?.from
    let [checkCode, setCheckCode] = useState("")
    let [create, setCreate] = useState(false)
    let [join, setJoin] = useState(false)
    let [image, setImage] = useState(true)
    let [joinMeet,setJoinMeet] = useState(false)
    const navigate = useNavigate()
    const [errorDisplay, setErrorDisplay] = useState(ifFrom ? true : false)
    useEffect(() => {
        if (ifFrom) {
            navigate('/', { replace: true, state: null })
        }
    }, [])
    const token = localStorage.getItem('token')
    const decoded = jwtDecode(token)

    const createMeetingCode = () => {
        const meetingCode = uuidv4().slice(0, 8)
        setCheckCode(meetingCode)
        return meetingCode;
    }

    let logout = () => {
        localStorage.removeItem('token')
        window.location.href = "/"
    }

    const joinstyle = {
        display: join ? "flex" : "none"
    }

    const gueststyle = {
        display: create ? "flex" : "none"
    }
    const errorstyle = {
        display: errorDisplay ? "flex" : "none",
        backgroundColor: "rgb(64 18 94)",
        color: "white"
    }


    let switchjoincreate = () => {
        setJoin(!join)
    }
    const isblur = () => {
        if (create === true || join === true) {
            return "block"
        }
    }
    const isErrorBgBlur = () => {
        if (errorDisplay === true) {
            return 'block'
        }
    }
    let errorHide = () => {
        setErrorDisplay(false)
    }

    let switchButton = () => {
        setCreate(!create)
    }
    let joinShow = () => {
        if (image === false && join === true && create === true) {
            setImage(false)
            setJoin(true)
            setCreate(false)
        } else if (image === true && join === false) {
            setImage(false)
            setJoin(true)
            setCreate(false)
        } else if (image === false && join === true & create === false) {
            setJoin(false)
            setImage(true)
        }


    }
    let createShow = () => {
        if (image === false && join === true && create === true) {
            setJoin(false)
            setImage(true)
        } else if (image === true && join === false) {
            setImage(false)
            setJoin(true)
            setCreate(true)
            createMeetingCode()
        } else if (image === false && join === true & create === false) {
            setCreate(true)
        }
    }

    let hide = () => {
        setCreate(false);
        setJoin(false);
        setImage(true)
    }



    return (
        <div className={styles.homepage}>
            <div className={styles.homestyle} style={{ display: isblur() }}></div>
            <div className={styles.errorHomestyle} style={{ display: isErrorBgBlur() }}></div>
            <nav className={styles.nav}>
                <ul className={styles.navleft}>
                    <img src="./images/LogoHome.png" className={styles.Logo} alt="" />
                    <li className={styles.Hometab}>Home</li>
                </ul>
                <ul className={styles.navright}>
                    <li className={styles.HistoryTab}>History</li>
                    <li onClick={logout} className={styles.Logout}>Logout</li>
                </ul>
            </nav>
            <div className={styles.mainbox}>
                <Error display={errorHide} style={errorstyle} joinMeet={joinMeet} />
                <div className={styles.left}>
                    <h1><span>Hi, {decoded.name}!&nbsp;</span> <span> Ready to Connect?</span></h1>
                    <div className={styles.buttonbox}>

                        <button className={styles.room} onClick={createShow}>Create Room</button>
                        <button className={styles.join} onClick={joinShow}>Join Room</button>
                    </div>

                </div>
                <div className={styles.right}>
                    {image ?
                        <img src="../images/vcimage.png" alt="vciamge" className={styles.vcimage} />
                        :

                        create ?
                            <CreateMeeting meetingCode={checkCode} switchButton={switchButton} display={hide} style={styles.createbox} />
                            :
                            <JoinMeeting setJoinMeet={setJoinMeet} setErrorDisplay={setErrorDisplay} style={joinstyle} create={create} switch={switchjoincreate} switchButton={switchButton} token={token} display={hide} />

                    }
                </div>
            </div>

            <div className={styles.bottombar}>
                <ul>
                    <li>
                        <span><i className="fa-regular fa-house"></i></span>
                        <p>Home</p>
                    </li>
                    <li><span><i className="fa-solid fa-clock-rotate-left"></i></span>
                        <p>History</p>
                    </li>


                </ul>
            </div>
        </div>
    )
}

export default Home
