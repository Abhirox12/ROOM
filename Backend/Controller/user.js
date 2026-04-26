import { User } from "../Model/user.js"
import httpStatus from "http-status";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";




const goToRegister = (req, res) => {
    res.redirect("/register.html");
}
const goToLogin = (req, res) => {
    res.redirect('/login.html')
}

const register = async (req, res) => {
    let { name, username, password, email } = req.body
    try {

        let findUser = await User.findOne({ username })
        if (findUser) {
            return res.status(httpStatus.FOUND).json({ message: "user already existed" })
        }
        let checkEmail = await User.findOne({ email })
        if (checkEmail) {
            return res.status(httpStatus.FOUND).json({ message: "email already used in another account" })

        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user1 = new User({ name, email, username, password: hashedPassword })
        let saved = await user1.save()
        console.log(saved)
        res.status(httpStatus.CREATED).json({ message: "New user Registered" })

    } catch (err) {
        res.json(`something went wrong ${err}`)
    }


}

const login = async (req, res) => {
    let { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "please provide your credentials" })
    }
    try {
        let checkUser = await User.findOne({ username })
        if (!checkUser) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "user not found" })
        }

        if (bcrypt.compare(password, checkUser.password)) {
            let token = crypto.randomBytes(20).toString("hex")
            checkUser.token = token;
            await checkUser.save();
            return res.status(httpStatus.OK).json({ token: token })
        }
    } catch (err) {
        return res.status(500).json({ message: `Something went wrong ${err}` })
    }
}

const guestUserMeeting = async (req, res) => {
    let { name, meetingCode } = req.body;
    if (!name || !meetingCode) {
        return res.status(400).json({ message: "please provide your credentials" })
    }
    try {
        let verifyCode = await meeting.find({ meetingCode })
        if (!verifyCode) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "meeting not found" })
        }
        res.send("joining meeting")
    } catch (err) {
        return res.status(500).json({ message: `Something went wrong ${err}` })

    }
}

export { register, login, goToRegister, goToLogin, guestUserMeeting } 