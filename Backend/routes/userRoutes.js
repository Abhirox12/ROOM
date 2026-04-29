import { Router } from "express";
import { register, login, guestUserMeeting } from "../Controller/user.js";

const router = Router()

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/guest').post(guestUserMeeting)

export default router;