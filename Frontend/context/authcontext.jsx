import axios from "axios";
import httpStatus   from "http-status";
import { useContext, createContext, useState } from "react";
import { useNavigate } from "react-router-dom";


export const AuthContext = createContext({})

const client = axios.create({
baseURL : "http://localhost:3000/"
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

            if (request.status === httpStatus.OK) {
                localStorage.setItem(request.data.token);
                router("/home")
            }
        } catch (error) {
            throw error
        }
    }
    const join = async (name,meetingCode)=>{
        try{
            let request = await client.post("/guest",{
                name:name,
                meetingCode:meetingcode
            })
        }catch(error){
            throw error
        }
    }

const data = {
    handleLogin,handleRegister, userData, setUserData,
}


    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider  >
    )
}

