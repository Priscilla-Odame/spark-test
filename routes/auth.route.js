const express = require("express");
const { createUserByEmailAndPassword, findUserByEmail, findUserById, findUserByPhone, resetPassword } = require("../controllers/user.controller");
const { isAuthenticated, isAdmin } = require("../middleware/auth.middleware");
const { v4: uuidv4 } = require("uuid");
const { generateTokens } = require("../utils/auth");
const { addRefreshTokenToWhitelist, deleteRefreshToken, findRefreshTokenById, revokeTokens } = require("../controllers/token.controller");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { hashToken } = require("../utils/auth");
const { sendEmail } = require("../utils/email");
const jwt = require("jsonwebtoken");


const router = express.Router();

router.post("/register", async (req, res, next) => {
    try {
        const {
            firstname,
            lastname,
            email,
            password,
            country,
            telephone,
            city,
            state,
            street_address
        } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "You must provide an email and a password." });
        }
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            res.status(400).json({ message: "Email already in use." });
        }
        const existingUserPhone = await findUserByPhone(telephone);
        if (existingUserPhone) {
            res.status(400).json({ message: "Phone number already in use." });
        }
        const user = await createUserByEmailAndPassword({
            firstname,
            lastname,
            email,
            password,
            country,
            telephone,
            city,
            state,
            street_address
        });
        const jti = uuidv4();
        const { accessToken, refreshToken } = generateTokens(user, jti);
        await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });
        res.json({
            user,
        });
    } catch (err) {
        next(err);
    }
});

router.post("/create-user", isAuthenticated, isAdmin, async (req, res, next) => {
    try {
        const {
            firstname,
            lastname,
            email,
            country,
            telephone,
            city,
            state,
            street_address
        } = req.body;
        if (!email) {
            res.status(400).json({ error: "You must provide an email and a password." });
        }
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            res.status(400).json({ error: "Email already in use." });
        }
        const existingUserPhone = await findUserByPhone(telephone);
        if (existingUserPhone) {
            res.status(400).json({ message: "Phone number already in use." });
        }
        password = `@This${crypto.randomBytes(3).toString('hex')}`;
        const user = await createUserByEmailAndPassword({
            firstname,
            lastname,
            email,
            password,
            country,
            telephone,
            city,
            state,
            street_address
        });
        const jti = uuidv4();
        const { accessToken, refreshToken } = generateTokens(user, jti);
        token = refreshToken;
        await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });
        res.json({ message: "User created successfully" })

        // const html = `You are receiving this because an account has been created for you.<br>
        //         Your details are:<br>
        //         <b>Email:</b>${user.email}<br>
        //         <c>Password:</b>${password}<br>
        //         Please click on the following link, or paste this into your browser to reset your password:<br>
        //         <a href=${process.env.CLIENT_URL}/api/v1/auth/reset-password?${token}>${process.env.CLIENT_URL}/api/v1/auth/reset-password?${token}</a><br>
        //         If you did not request this, please ignore this email and your password will remain unchanged`
        // // Send Email
        // sendEmail(user.email, "Account created", html);
    } catch (err) {
        next(err);
    }
});

router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ erro: "You must provide an email and a password." });
        }
        const existingUser = await findUserByEmail(email);
        if (!existingUser || existingUser.isActive === false) {
            res.status(403).json({ error: "Invalid login credentials." });
        }
        const validPassword = await bcrypt.compare(password, existingUser.password);
        if (!validPassword) {
            res.status(403).json({ error: "Invalid login credentials." });
        }
        const jti = uuidv4();
        const { accessToken, refreshToken } = generateTokens(existingUser, jti);
        await addRefreshTokenToWhitelist({
            jti,
            refreshToken,
            userId: existingUser.id,
        });
        existingUser.password = undefined;
        user = JSON.parse(JSON.stringify(existingUser));
        res.json({
            accessToken,
            refreshToken,
            user: user,
        });
    } catch (err) {
        next(err);
    }
});

router.post("/forgot-password", async (req, res, next) => {
    var token;
    try {
        const { email } = req.body;
        const existingUser = await findUserByEmail(email);

        if (!existingUser) {
            res.status(403).json({ message: "Invalid email." });
        }
        console.log(existingUser);
        const jti = uuidv4();
        const { accessToken, refreshToken } = generateTokens(existingUser, jti);
        token = refreshToken;
        await addRefreshTokenToWhitelist({
            jti,
            refreshToken,
            userId: existingUser.id,
        });
        // const html = `You are receiving this because you requested to reset your password.<br>
        //         Please click on the following link, or paste this into your browser to reset your password:<br>
        //         <a href=${process.env.CLIENT_URL}/passwordreset?${token}>${process.env.CLIENT_URL}/passwordreset?${token}</a><br>
        //         If you did not request this, please ignore this email and your password will remain unchanged`
        // // Send Email
        // sendEmail(existingUser.email, "Reset Password", html);
        // res.status(200).json({ message: "Please check your mail for the reset password link" });

    } catch (err) {
        next(err);
    }
});


router.post("/refreshToken", async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({ error: "Missing refresh token." });
        }
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const savedRefreshToken = await findRefreshTokenById(payload.jti);

        if (!savedRefreshToken || savedRefreshToken.revoked === true) {
            res.status(401).json({ error: "Unauthorized" });
        }

        const hashedToken = hashToken(refreshToken);
        if (hashedToken !== savedRefreshToken.hashedToken) {
            res.status(401).json({ error: "Unauthorized" });
        }
        const user = await findUserById(payload.userId);
        if (!user) {
            res.status(401).json({ error: "Unauthorized" });
        }
        await deleteRefreshToken(savedRefreshToken.id);
        const jti = uuidv4();
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(
            user,
            jti
        );
        await addRefreshTokenToWhitelist({
            jti,
            refreshToken: newRefreshToken,
            userId: user.id,
        });

        res.json({
            accessToken,
            refreshToken: newRefreshToken,
        });
    } catch (err) {
        next(err);
    }
});

router.post("/revokeRefreshTokens", async (req, res, next) => {
    try {
        const { userId } = req.body;
        await revokeTokens(userId);
        res.json({ message: `Tokens revoked for user with id #${userId}` });
    } catch (err) {
        next(err);
    }
});

router.patch("/reset-password", async (req, res) => {
    try {
        // we take the token to reset password
        const { token, newpassword } = req.body;
        if (!token) {
            res.status(400).json({ error: "Missing refresh token." });
        }
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const savedRefreshToken = await findRefreshTokenById(payload.jti);
        if (!savedRefreshToken || savedRefreshToken.revoked === true) {
            res.status(401).json({ error: "Unauthorized" });

        }
        const hashedToken = hashToken(token);
        if (hashedToken !== savedRefreshToken.hashedToken) {
            res.status(401).json({ error: "Unauthorized" });
        }
        const user = await findUserById(payload.userId);
        if (!user) {
            res.status(401).json({ error: "Unauthorized" });
        }
        user.password = newpassword;
        await resetPassword(user);
        const jti = uuidv4();
        const { accessToken, refreshToken } = generateTokens(user, jti);
        await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });
        res.json({
            accessToken,
            refreshToken,
            user,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
});


module.exports = router;
