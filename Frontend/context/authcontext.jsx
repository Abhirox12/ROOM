import axios, { HttpStatusCode } from "axios";
import httpStatus from "http-status";
import { useContext, createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"
const token = localStorage.getItem("token")



export const AuthContext = createContext({})

const client = axios.create({

    baseURL: "https://192.168.1.3:3000/"
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
            if (error.response?.status === httpStatus.CONFLICT || error.response?.status === 400) {
                return error.response.data.message
            }
        }
    }
    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
            })

            if (request.status === httpStatus.OK) {
                localStorage.setItem('token', request.data.token);
                router("/home")
            }
        } catch (error) {
            if (error.response?.status === 400 || error.response?.status === httpStatus.NOT_FOUND || error.response?.status === 401) {
                return error.response.data.message
            }
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

        const token = localStorage.getItem('token')
        if (token) {
            const decoded = jwtDecode(token)
            Hostname = decoded.name

            try {
                let request = await client.post(`/create/${meetingCode}`, {
                    meetingCode: meetingCode,
                    Hostname: decoded.name,
                    joiner: []
                })
            }
            catch (error) {
                throw error
            }
        }
    }

    const checkMeeting = async (meetingCode) => {
        try {
            let request = await client.get(`/check/${meetingCode}`, {
                meetingCode: meetingCode,
            },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            if (request.status === 200) {

                return true
            }
            return false
        } catch {
            return false
        }
    }


    const guestUserMeeting = async (meetingCode) => {
        if (meetingCode) {

            try {
                let request = await client.post(`/guestjoin/${meetingCode}`, {
                    meetingCode: meetingCode,
                })
                if (request.status === 200) {
                    return true
                }

            } catch (error) {
                if (error.response?.status === 400 || error.response?.status === httpStatus.NOT_FOUND) {
                    return error.response.data.message
                }
            }
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

