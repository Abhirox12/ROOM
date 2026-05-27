import axios, { HttpStatusCode } from "axios";
import httpStatus from "http-status";
import { useContext, createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"
// import { Meeting } from "../../Backend/Model/meeting";


export const AuthContext = createContext({})

const client = axios.create({
    baseURL: "http://localhost:3000/"
}
)


export const AuthProvider = ({ children }) => {

    const authContext = useContext(AuthContext);

    const [userData, setUserData] = useState(authContext)

    const router = useNavigate()


    const handleRegister = async (name, username, email, password) => {
        try {
            let request = await client.post("/register", {
                name: name,
                username: username,
                email: email,
                password: password
            })
            if (request.status === httpStatus.CREATED) {
                return request.data.message;
            }
        } catch (error) {
            throw error
        }
    }
    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
            })

            console.log(username, password)
            console.log(request)
            console.log(request.data) // ← check this


            if (request.status === httpStatus.OK) {
                localStorage.setItem('token', request.data.token);
                router("/home")
            }
        } catch (error) {
            throw error
        }
    }
    const join = async (name, meetingCode) => {
        try {
            let request = await client.post("/:meetingCode", {
                meetingCode: meetingCode
            })
        } catch (error) {
            throw error
        }


    }

    const handleCreateMeeting = async (meetingCode, Hostname) => {
        console.log("received in context:", meetingCode) 

        const token = localStorage.getItem('token')
        if (token) {
            const decoded = jwtDecode(token)
            Hostname = decoded.name
            console.log("creating meeting")
            console.log("sending:", meetingCode)

            try {
                console.log("sending:", meetingCode)

                let request = await client.post(`/create/${meetingCode}`, {
                    meetingCode: meetingCode,
                    Hostname: decoded.name,
                    joiner: []
                })
                console.log("1")
            }
            catch (error) {
                throw error
            }
        }
    }

    const checkMeeting = async (meetingCode) => {
        try {
            console.log(meetingCode)
            console.log(":")
            let request = await client.get(`/check/${meetingCode}`, {
                meetingCode: meetingCode,
            })
            console.log("request")
            if (request.status === 200) {
                
                return true
            }
            return false
        } catch {
            return false
        }
    }


    const guestUserMeeting = async (meetingCode) => {
        console.log(meetingCode)
        try {
            let request = await client.post(`/guestjoin/${meetingCode}`, {
                meetingCode: meetingCode,
            })
            console.log(request)
            if (request.status === 200) {
                console.log("true")
                return true
            }
            console.log("false")
            return false
        } catch {
            console.log("catch false")
            return false
        }
    }

    const data = {
        handleLogin, handleRegister, userData, setUserData, handleCreateMeeting, checkMeeting, guestUserMeeting
    }


    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider  >
    )
}

