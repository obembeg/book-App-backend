const express = require("express");
const router = express.Router();

const prisma = require("../helper/prisma");
const userSchema = require("../joiSchema/schema");
const argon = require("argon2");
const jwt = require("jsonwebtoken");
const config = require("config");

const authProtect = require("../middleware/auth");
const adminProtect = require("../middleware/authAdmin");
const { func } = require("joi");

router.post("/register", async (req, res, next) => {
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
    const hashedPassword = await argon.hash(password);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    if (newUser) {
      await prisma.profile.create({
        data: {
          userId: newUser.id,
        },
      });
    }

    const payload = {
      sub: newUser.id,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      // isAllowed: newUser.isAllowed,
    };
    const jwtOption = { expiresIn: 360000 };

    const token = await jwt.sign(payload, process.env.JWT_SECRET, jwtOption);

    return res.status(201).json({
      message: "User created successfully",
      accesstoken: token,
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/admin/fetchall",
  [authProtect, adminProtect],
  async (req, res, next) => {
    try {
      // if (!isAdmin) {
      //   return res.status(404).json({ 
      //           message: "error"
      //          });

      // }
      const users = await prisma.user.findMany({
        select: {
          email: true,
          id: true,
          isAdmin: true,
          isAllowed: true,

          profile: {
            select: {
              fullName: true,
            },
          },
          books: {
            select: {
              title: true,
              id: true,
              description: true,
              price: true,
              author: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      return res.status(200).json({ users });
    } catch (error) {
      next(error);
    }
  },
);

// Fetch single user
router.get("/single", authProtect, async (req, res, next) => {
  try {
    const { sub } = req.user;
    const user = await prisma.user.findUnique({
      where: { id: Number(sub) },
      select: {
        email: true,

        profile: {
          select: {
            fullName: true,
            bio: true,
            createdAt: true,
          },
        },
        books: {
          select: {
            title: true,
            description: true,
            price: true,
            author: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    if (user) {
      return res.status(200).json({ user });
    }
    return res.status(400).json({ message: "User not found" });
  } catch (error) {
    next(error);
  }
});

router.put("/update", authProtect, async (req, res, next) => {
  try {
    const { sub } = req.user;
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({
        message: "Account update failed.",
      });
    }

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

    const hashedPassword = await argon.hash(password);
    const updatedUser = await prisma.user.update({
      where: { id: Number(sub) },
      data: { email, password: hashedPassword },

      select: {
        email: true,
      },
    });
    return res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    next(error);
  }
});

router.delete("/delete", authProtect, async (req, res, next) => {
  try {
    const { sub } = req.user;
    const user = await prisma.user.findUnique({
      where: { id: Number(sub) },
    });
    if (user) {
      const deletedBooks = await prisma.book.deleteMany({
        where: { userId: Number(id) },
      });
      const profile = await prisma.profile.findUnique({
        where: { userId: Number(id) },
      });
      if (profile) {
        const deletedProfile = await prisma.profile.delete({
          where: { id: profile.id },
        });
      }
      const deletedUser = await prisma.user.delete({
        where: { id: Number(id) },
        select: {
          email: true,
        },
      });

      return res
        .status(200)
        .json({ message: "User deleted successfully", user: deletedUser });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.delete(
  "/admin/delete/:id",
  [authProtect, adminProtect],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (user) {
        const deletedBooks = await prisma.book.deleteMany({
          where: { userId: Number(id) },
        });
        const profile = await prisma.profile.findUnique({
          where: { userId: Number(id) },
        });
        if (profile) {
          const deletedProfile = await prisma.profile.delete({
            where: { id: profile.id },
          });
        }
        const deletedUser = await prisma.user.delete({
          where: { id: Number(id) },
          select: {
            email: true,
          },
        });

        return res
          .status(200)
          .json({ message: "User deleted successfully", user: deletedUser });
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/admin/update",
  [authProtect, adminProtect],
  async (req, res, next) => {
    try {
      const { sub } = req.user;
      const { email, password, isAdmin } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return res.status(400).json({
          message: "Account update failed.",
        });
      }

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

      const hashedPassword = await argon.hash(password);
      const updatedUser = await prisma.user.update({
        where: { id: Number(sub) },
        data: { email, password: hashedPassword, isAdmin: isAdmin },

        select: {
          email: true,
        },
      });
      return res
        .status(200)
        .json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
      next(error);
    }
  },
);
router.put(
  "/admin/useraccess/:id",
  [authProtect, adminProtect],
  async (req, res, next) => {
    try {
      // const { sub } = req.user;
      const { id } = req.params;

      const { isAllowed, isAdmin } = req.body;

      // const valResult = userSchema.userVal.validate(req.body, {
      //   abortEarly: false,
      // });

      // if (valResult.error) {
      //   return res.status(400).send(valResult.error.details);
      // }

      // const hashedPassword = await argon.hash(password);
      const userAccess = await prisma.user.update({
        where: { id: Number(id) },
        data: { isAllowed, isAdmin },

        select: {
          email: true,
          isAllowed: true,
          isAdmin: true,
        },
      });
      return res
        .status(200)
        .json({
          message: "User access updated successfully",
          user: userAccess,
        });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
