import React, { useContext, useState } from 'react'
import withAuth from '../../utilities/authguard'
import styles from "../Css files/home.module.css"
import { jwtDecode } from "jwt-decode"
import JoinMeeting from './guestmeeting'
import CreateMeeting from './createbox'
import { v4 as uuidv4 } from 'uuid'




function Home() {
    let [create, setCreate] = useState(false)
    let [join, setJoin] = useState(false)
    let [image, setImage] = useState(true)
    // let [createMeeting] = useContext(AuthContext)

    const token = localStorage.getItem('token')
    const decoded = jwtDecode(token)

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
        // setCreate(!create);
        setJoin(!join)

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
            <nav className={styles.nav}>
                <ul>
                    <li>Room</li>
                    <li>Home</li>
                </ul>
                <ul>
                    <li>History</li>
                    <li onClick={logout}>Logout</li>
                </ul>
            </nav>
            <div className={styles.mainbox}>
                <div className={styles.left}>
                    <h1>Hi, {decoded.name} !<br />Ready to Connect?</h1>
                    <div className={styles.buttonbox}>

                        <button className={styles.room} onClick={createShow}>Create Room</button>
                        <button className={styles.join} onClick={joinShow}>Join Room</button>
                    </div>

                </div>
                <div className={styles.right}>
                    {image ?
                        <img src="../vcimage.png" alt="vciamge" className={styles.vcimage} />
                        :

                        create ?
                            <CreateMeeting meetingCode={createMeetingCode()} style={styles.createbox} />
                            :
                            <JoinMeeting style={joinstyle} create={create} switch={switchjoincreate} switchButton={switchButton} token={token} display={hide} />

                    }
                </div>
            </div>
        </div>
    )
}

export default withAuth(Home)
