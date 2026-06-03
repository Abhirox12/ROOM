import React, { useContext, useState } from 'react'
// import withAuth from '../../utilities/authguard'
import styles from "../Css files/home.module.css"
import { jwtDecode } from "jwt-decode"
import JoinMeeting from './guestmeeting'
import CreateMeeting from './createbox'
import { v4 as uuidv4 } from 'uuid'




function Home() {
    let [create, setCreate] = useState(false)
    let [join, setJoin] = useState(false)
    let [image, setImage] = useState(true)

    const token = localStorage.getItem('token')
    // const decoded = jwtDecode(token)

    const createMeetingCode = () => {
        const meetingCode = uuidv4().slice(0, 8)
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

    let switchjoincreate = () => {
        setJoin(!join)
    }
    const isblur = () => {
    if (create === true || join === true) {
      return "block"
    }
  }


    let switchButton = () => {
        setCreate(!create)
    }
    let joinShow = () => {
        if (image === false && join === true && create === true) {
            setImage(false)
            setJoin(true)
            setCreate(false)
            console.log("j1")
        } else if (image === true && join === false) {
            setImage(false)
            setJoin(true)
            setCreate(false)
            console.log("j2")
        } else if (image === false && join === true & create === false) {
            setJoin(false)
            setImage(true)
            console.log("j3")
        }


    }
    let createShow = () => {
        if (image === false && join === true && create === true) {
            setJoin(false)
            setImage(true)
            console.log("c1")
        } else if (image === true && join === false) {
            setImage(false)
            setJoin(true)
            setCreate(true)
            createMeetingCode()
            console.log("c2")
        } else if (image === false && join === true & create === false) {
            setCreate(true)
            console.log("c3")
        }
    }

    let hide = () => {
        setCreate(false);
        setJoin(false);
        setImage(true)
    }



    return (
        <div className={styles.homepage}>
            <div className={styles.homestyle} style={{display:isblur()}}></div>
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
                <div className={styles.left}>
                    <h1><span>Hi, Abhimanyu!&nbsp;</span> <span> Ready to Connect?</span></h1>
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
                            <CreateMeeting meetingCode={createMeetingCode()} switchButton={switchButton} display={hide} style={styles.createbox} />
                            :
                            <JoinMeeting style={joinstyle} create={create} switch={switchjoincreate} switchButton={switchButton} token={token} display={hide} />

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
