import { Router } from "express";
import { sendOTP, verifyOTP } from "../controllers/auth.Controller.js";

const router = Router();

router.route("/sendotp").post(sendOTP);
router.route("/verifyotp").post(verifyOTP);

export default router;
