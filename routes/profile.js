const express = require("express");
const router = express.Router();

const prisma = require("../helper/prisma");
const profileSchema = require("../joiSchema/schema");

const authProtect = require("../middleware/auth");

router.post("/create", authProtect, async (req, res, next) => {
  try {
    const valResult = profileSchema.profileVal.validate(req.body, {
      abortEarly: false,
    });
    if (valResult.error) {
      return res.status(400).send(valResult.error.details);
    }
    const { fullName, bio } = req.body;
    const { sub } = req.user;
    const newProfile = await prisma.profile.create({
      where: {
        userId: Number(sub),
      },
      data: {
        fullName,
        bio,
      },
    });
    res.status(201).json({ message: "Profile created successfully" });
  } catch (error) {
    next(error);
  }
});

router.get("/single", authProtect, async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: {
        userId: Number(req.user.sub),
      },
    });
    return res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
});

router.put("/update", authProtect, async (req, res, next) => {
  try {
    const valResult = profileSchema.profileVal.validate(req.body, {
      abortEarly: false,
    });
    if (valResult.error) {
      return res.status(400).send(valResult.error.details);
    }

    const { fullName, bio } = req.body;
    const { sub, isAdmin } = req.user;
    const updatedProfile = await prisma.profile.update({
      where: { userId: Number(sub) },

      data: {
        fullName,
        bio,
      },
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/delete", authProtect, async (req, res, next) => {
  try {
    const { sub, isAdmin } = req.user;
    const profile = await prisma.profile.findUnique({
      where: { userId: Number(sub) },
    });
    if (profile) {
      const deletedProfile = await prisma.profile.delete({
        where: { userId: Number(sub) },
      });
      return res.status(200).json({
        message: "Profile deleted successfully",
      });
    }
    return res.status(404).json({ message: "Profile not found" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
