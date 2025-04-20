import {Request, Response} from "express";
import {loginUser, registerUser} from "../repositories/userRepository";


export async function loginController(req: Request, res: Response) {
    const {usernameOrEmail, password} = req.body;
    if (!usernameOrEmail || !password) {
        res.status(401).send("Username or password is required");
    }

    const loginResult = await loginUser(usernameOrEmail, password);
    if (!loginResult) {
        res.status(401).send("Username or password is required");
    }

    res.status(200).json({
        status: "success",
        user: loginResult
    })
}

export const registerController = async (req: Request, res: Response) => {
    const {email, username, password, firstName, lastName} = req.body;

    console.log(req.body, "request ")
    if (!username || !password || !email || !firstName || !lastName) {
        res.status(401).send("You must fill all fields in order to register");
    }


    try {
        const registerResult = await registerUser(
            email,
            username,
            password,
            firstName,
            lastName
        )

        res.status(200).json({
            status: "success",
            user: registerResult
        })

    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error
        })
    }

}