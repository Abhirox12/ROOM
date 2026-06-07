import { Router } from "express";
import { register, login, guestUserMeeting, createMeeting, checkMeeting, verifyToken } from "../Controller/user.js";

const router = Router()

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/create/:meetingcode').post(createMeeting, verifyToken)
router.route('/guestjoin/:meetingCode').post(guestUserMeeting)
router.route(`/check/:meetingCode`).get(checkMeeting)

export default router;