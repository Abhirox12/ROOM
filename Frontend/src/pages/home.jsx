import React, { useState } from 'react'
import withAuth from '../../utilities/authguard'
import styles from "../Css files/home.module.css"
import { jwtDecode } from "jwt-decode"
import JoinMeeting from './guestmeeting'



function Home() {
    let [create, setCreate] = useState(false)
    let [box, setBox] = useState(false)
    let [image, setImage] = useState(true)

    const token = localStorage.getItem('token')
    const decoded = jwtDecode(token)


    let logout = () => {
        localStorage.removeItem('token')
        window.location.href = "/"
    }

    const joinstyle = {
        display: box ? "flex" : "none"
    }

    const gueststyle = {
        display: create ? "flex" : "none"
    }

    let switchjoincreate = () => {
        // setCreate(!create);
        setBox(!box)

    }


    let switchButton = ()=>{
        setCreate(!create)
    }
    let joinShow = () => {
        if (image === false && box === true && create === true) {
            setImage(false)
            setBox(true)
            setCreate(false)
            console.log("j1")
        } else if (image === true && box === false) {
            setImage(false)
            setBox(true)
            setCreate(false)
            console.log("j2")
        } else if (image === false && box === true & create === false) {
            setBox(false)
            setImage(true)
            console.log("j3")
        }
        
        
    }
    let createShow = () => {
        if (image === false && box === true && create === true) {
            setBox(false)
            setImage(true)
            console.log("c1")
        } else if (image === true && box === false) {
            setImage(false)
            setBox(true)
            setCreate(true)
            console.log("c2")
        } else if (image === false && box === true & create === false) {
            setCreate(true)
            console.log("c3")
        }
    }

    let hide = () => {
        setCreate(false);
        setBox(false);
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
                        <JoinMeeting style={joinstyle} create={create} switch={switchjoincreate} switchButton={switchButton} token={token} display={hide} />
                    }
                </div>
            </div>
        </div>
    )
}

export default withAuth(Home)
