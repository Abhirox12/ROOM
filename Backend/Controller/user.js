import { User } from "../Model/user.js"
import httpStatus from "http-status";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";
import jwt from 'jsonwebtoken';
import { Meeting } from "../Model/meeting.js";
import { Guest } from "../Model/guest.js";



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
            let token = jwt.sign(
                {
                    userId: checkUser._id,
                    username: checkUser.username,
                    name: checkUser.name
                },
                process.env.JWT_SECRET,   // add this in .env file
                { expiresIn: '7d' }
            )
            checkUser.token = token;
            await checkUser.save();
            return res.status(httpStatus.OK).json({ token: token, message: "login done" })
        }
    } catch (err) {
        return res.status(500).json({ message: `Something went wrong ${err}` })
        console.log(err)
    }
}

const guestUserMeeting = async (req, res) => {
    // console.log(req.params)
    let {  meetingCode } = req.params;
    console.log(meetingCode)
    if (!meetingCode) {
        console.log("code not found")
        return res.status(400).json({ message: "please provide your credentials" })
    }
    try {
        console.log('2')
        let meeting = await Meeting.findOne({ meetingCode:meetingCode })
        console.log(meeting)
        if (!meeting) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "meeting not found" })
        }
        let guest1 = await Guest({ meetingCode })
        await guest1.save()
        meeting.joiner.push(guest1)
        await meeting.save()
        
        res.redirect("joining meeting")
    } catch (err) {
        return res.status(500).json({ message: `Something went wrong ${err}` })

    }
}
const createMeeting = async (req, res) => {
    let { meetingCode, guest, Hostname } = req.body;
    console.log(meetingCode)


    let meeting = await Meeting.find({ meetingCode })
    console.log(meeting)
    if (meeting.length >> 0) {
        console.log("meeting")
        return res.status(409).json({ message: "meeting already exists" })
        console.log("meeting")


    }
    try {
        const meeting1 = new Meeting({ Hostname, meetingCode })

        let saved = await meeting1.save()
        console.log('1')
        console.log(saved)
        // let Guest = await Guest.findById({id})
        // meeting1.push(Guest)

        res.status(200).json({ message: "meeting created" })

    } catch (err) {
        return res.status(500).json({ message: `Something went wrong ${err}` })

    }
}
const joinMeeting = async (req, res) => {

}

const checkMeeting = async (req, res) => {

    let { meetingCode } = req.params;
    console.log("yes check"+ meetingCode)
    let CheckCode = await Meeting.findOne({ meetingCode: meetingCode })
    console.log(`yes ${CheckCode}`)
    if (CheckCode) {
        return res.status(200).json({ valid: true })
    }
    return res.status(404).json({ valid: false })
}

export { register, login, guestUserMeeting, createMeeting, checkMeeting,joinMeeting } 