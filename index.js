const express = require('express');
const app = express();
const {authRouter} = require('./routes/authrouter');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/jwtauth");

app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: process.env.FRONTEND_BASE_URL,
        credentials: true
    }));

app.use("/api/auth", authRouter)

app.post("/api/auth/google", (req, res) => {
    const jwts = req.body.jwt;
    const data = jwt.decode(jwts);
    console.log(data);
    const email = data.email;
    const newJwt = jwt.sign({'email': email}, process.env.JWT_SECRET)
    res.status(200).json({
        jwt  : newJwt
    });

})

app.post("/api/auth/info", authMiddleware, (req, res) => {
    console.log(req.user);
    const email = req.user.email;
    if(email === "admin@gmail.com"){
        return     res.status(200).json({
            email: "admin@gmail.com",
            secretKey: "merejaisebhondukeliyeyeduniyanahibaniplshelp"
        })
    }
    res.status(200).json({
        email: email,
        secretKey: "You are not and admin, Lol"
    })
})

app.get("/", (req, res) => {
    res.status(200).send("Welcome to our accounts.");
})

app.listen(8081, () => {console.log("Listening on port 8081")});



