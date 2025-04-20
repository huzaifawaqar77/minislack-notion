import express from "express";
import {registerUser} from "../repositories/userRepository";
import {loginController, registerController} from "../controller/authController";

const router = express.Router();


router.post('/register', registerController);

router.post('/login', loginController)


export default router;