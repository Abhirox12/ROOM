import React, { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../../context/authcontext'
import { Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import VideoMeet from './videomeet'


export default function ProtectedMeeting() {
    const [valid, setValid] = useState(null)
    const { checkMeeting, guestUserMeeting } = useContext(AuthContext)
    const { meetingCode } = useParams()
    const token = localStorage.getItem('token')
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const isCreating = searchParams.get('type') === 'create';
    useEffect(() => {
        if (!token && !isCreating) {


            let checkRoute = async () => {
                let result = await checkMeeting(meetingCode)
                if (result) {
                    setValid(result)
                } else {
                    setValid(false)
                }
            }

            checkRoute()

        }
        if (token && isCreating) {
            setValid(true)
        }
        if (token && !isCreating) {
            let checkRoute = async () => {
                let result = await guestUserMeeting(meetingCode)
                if (result) {

                    setValid(result)
                } else {

                    setValid(false)
                }
            }
            checkRoute()
        }
        if (!token && isCreating) {
            setValid(false)
        }
    }, [meetingCode])


    if (valid === null) {
        return <p>Still Loading.....</p>
    }
    else if (valid === false) {
        const pathName = location.pathname
        return <Navigate to="/" replace state={{ from: pathName }} />

    }
    else {

        return <VideoMeet />
    }
}

