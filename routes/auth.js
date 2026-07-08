const express = require("express");
const router = express.Router();

const prisma = require("../helper/prisma");
const argon = require("argon2");
const jwt = require("jsonwebtoken");

const userSchema = require("../joiSchema/schema");
const config = require("config");

const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/login", async (req, res, next) => {
  try {
    const valResult = userSchema.userVal.validate(req.body, {
      abortEarly: false,
    });

    const pwdResult = userSchema.pVal.validate(req.body.password);

    if (valResult.error) {
      return res.status(400).send(valResult.error.details);
    }

    if (pwdResult.error) {
      return res.status(400).send(pwdResult.error.details);
    }

    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({ message: "Auth error" });
    }
    const isPasswordValid = await argon.verify(user.password, password);
    if (!isPasswordValid) {
      return res.status(404).json({ message: "Auth error" });
    }

    //create token
    const payload = {
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      // isAllowed: user.isAllowed,
    };

    const jwtOption = { expiresIn: 360000 };

    const token = jwt.sign(payload, process.env.JWT_SECRET, jwtOption);

    return res.status(200).json({ accesstoken: token });
  } catch (error) {
    next(error);
  }
});

router.post("/google", async (req, res, next) => {
  try {
    const { googleToken } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const googlePayload = ticket.getPayload();

    // console.log(payload);
    const { email } = googlePayload;

    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
       user = await prisma.user.create({
        data: {
          email,
          provider: "google",
        },
      });

      await prisma.profile.create({
        data: {
          userId: user.id,
        },
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    const jwtOption = { expiresIn: 360000 };
    const token = jwt.sign(payload, process.env.JWT_SECRET, jwtOption);
    return res.status(200).json({ accesstoken: token });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
