import { User } from "../Model/user.js"
import httpStatus from "http-status";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";
import jwt from 'jsonwebtoken';
import { Meeting } from "../Model/meeting.js";
import { Guest } from "../Model/guest.js";



const register = async (req, res) => {
    let { name, username, password, email } = req.body
    if (!name || !email || !username || !password) {
        return res.status(400).json({ message: "please fill your all details" })
    }
    try {

        let findUser = await User.findOne({ username })
        if (findUser) {
            return res.status(httpStatus.CONFLICT).json({ message: "Username already exists. Try something else" })
        }
        let checkEmail = await User.findOne({ email })
        if (checkEmail) {
            return res.status(httpStatus.CONFLICT).json({ message: "Email already exists. Use Another mail" })

        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user1 = new User({ name, email, username, password: hashedPassword })
        let saved = await user1.save()
        res.status(httpStatus.CREATED).json({ message: "New user Registered" })

    } catch (err) {
        res.json(`something went wrong ${err}`)
    }


}

const login = async (req, res) => {
    let { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Please provide your credentials" })
    }
    try {
        let checkUser = await User.findOne({ username })
        if (!checkUser) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found. Click on signup to create a new one" })
        }

        if (await bcrypt.compare(password, checkUser.password)) {
            let token = jwt.sign(
                {
                    userId: checkUser._id,
                    username: checkUser.username,
                    name: checkUser.name
                },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            )
            checkUser.token = token;
            await checkUser.save();
            return res.status(httpStatus.OK).json({ token: token, message: "login done" })
        } else {
            return res.status(401).json({ message: "invalid password" })
        }
    } catch (err) {
        return res.status(500).json({ message: `Something went wrong ${err}` })
    }
}

const guestUserMeeting = async (req, res) => {
    let { meetingCode } = req.params;
    try {
        if (meetingCode === "") {
            return res.status(400).json({ message: "please provide your credentials" })
        }
        let meeting = await Meeting.findOne({ meetingCode: meetingCode })
        if (!meeting) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "meeting not found" })
        }
        let guest1 = await Guest({ meetingCode })
        let saved = await guest1.save()

        meeting.joiner.push(guest1)
        await meeting.save()

        return res.status(200).json({ message: "Joining meeting" })
    } catch (err) {
        return res.status(500).json({ message: `Something went wrong ${err}` })

    }
}
const createMeeting = async (req, res) => {
    let { meetingCode, guest, Hostname } = req.body;
    let meeting = await Meeting.findOne({ meetingCode })
    if (meeting) {
        return res.status(409).json({ message: "meeting already exists" })
    }
    try {
        const meeting1 = new Meeting({ Hostname, meetingCode })
        let saved = await meeting1.save()
        res.status(200).json({ message: "meeting created" })

    } catch (err) {
        return res.status(500).json({ message: `Something went wrong ${err}` })

    }
}
const joinMeeting = async (req, res) => {

}

const checkMeeting = async (req, res) => {

    let { meetingCode } = req.params;
    let CheckCode = await Meeting.findOne({ meetingCode: meetingCode })
    if (CheckCode) {
        return res.status(200).json({ valid: true })
    }
    return res.status(404).json({ valid: false })
}

export { register, login, guestUserMeeting, createMeeting, checkMeeting, joinMeeting } 