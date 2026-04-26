import { Router } from "express";
import { register, login, goToRegister, goToLogin, guestUserMeeting } from "../Controller/user.js";

const router = Router()

router.route('/register').get(goToRegister).post(register);
router.route('/login').get(goToLogin).post(login);
router.route('/guest').post(guestUserMeeting)

export default router;