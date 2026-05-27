import React, { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../../context/authcontext'
import { Navigate, useParams } from 'react-router-dom'
import VideoMeet from './videomeet'

export default function ProtectedMeeting() {
    const [valid, setValid] = useState(null)
    const { checkMeeting } = useContext(AuthContext)
    const { meetingCode } = useParams()
    const token = localStorage.getItem('token')

    if(!token){
    useEffect(() => {
        console.log(checkMeeting())
        console.log(meetingCode)
        let checkRoute = async () => {
            let result = await checkMeeting(meetingCode)
            console.log(result)
            if (result) {
                setValid(result)
            } else {
                setValid(false)
            }
        }
        checkRoute()
    }, [meetingCode])


    if (valid === null) {
        return <p>Still Loading.....</p>
    }
    if (valid=== false) {
        console.log("this executed")
        return <Navigate to="/" replace />
    }
}
    return <VideoMeet />

}
