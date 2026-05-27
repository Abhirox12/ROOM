import { Router } from "express";
import { register, login, guestUserMeeting, createMeeting, checkMeeting, joinMeeting } from "../Controller/user.js";

const router = Router()

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/create/:meetingcode').post(createMeeting)
router.route('/guestjoin/:meetingCode').post(guestUserMeeting)
router.route('/join/:meetingcode').post(joinMeeting)
router.route(`/check/:meetingCode`).get(checkMeeting)

export default router;