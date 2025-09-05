const express = require("express");
const router = express.Router({caseSensitive: false, strict: false, mergeParams: false});
require("dotenv").config();
const axios = require("axios");
const prisma = require('../prisma')
const jwt = require('jsonwebtoken');
const authMiddleware = require("../middleware/jwtauth");

router.get("/google",(req,res)=>{
            const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID.toString()}&redirect_uri=${process.env.REDIRECT_URI.toString()}&response_type=code&scope=profile email`;
            res.redirect(url);
        })

        router.get("/google/callback", async (req, res) => {
            const {code} = req.query;

            try {
                // exchange this code for auth headers
                const promise = await fetch("https://oauth2.googleapis.com/token", {
                    method: "POST",
                    body: JSON.stringify({
                        client_id: process.env.GOOGLE_CLIENT_ID.toString(),
                        client_secret: process.env.GOOGLE_CLIENT_SECRET.toString(),
                        code,
                        redirect_uri: process.env.REDIRECT_URI.toString(),
                        grant_type: 'authorization_code',
                    })
                })

                // access_token is oauth
                const {access_token, id_token} = await promise.json();

                const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
                    headers: { Authorization: `Bearer ${access_token}` },
                });

        console.log(profile);
        const email = profile.email;
        if (!email) {
            return res.status(401).send({error: "Email or password is incorrect"});
        }
        const user = await prisma.lab_users.findUnique({ where: {
                username: email
            } });
        if (!user) {
            await prisma.lab_users.create({
                data: {
                    username: email.toString(),
                }
            })
        }

        res.redirect(`${process.env.FRONTEND_BASE_URL}/bug?jwt=${id_token}`);

    }
    catch(err){
        res.status(401).send({
            error: err.message,
        })
    }

})

router.post("/logout", authMiddleware, (req, res) => {
    res.clearCookie("access_token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });

    return res.status(200).json({ message: "Logged out successfully" });
})

module.exports = {
    authRouter: router,
}