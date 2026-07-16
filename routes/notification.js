const express = require("express");
const router = express.Router();

const prisma = require("../helper/prisma");
const authProtect = require("../middleware/auth");
const adminProtect = require("../middleware/authAdmin");

const { sendRestrictionEmail } = require("../services/mailService");
const { createNotification } = require("../services/notificationService");

const { getIO } = require("../socket");

router.get("/", authProtect, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.sub,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      notifications,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/welcome", authProtect, async (req, res, next) => {
  try {
    await createNotification({
      userId: req.user.sub,
      title: "Welcome 🎉",
      message: "This is your first notification.",
    });

    return res.json({
      message: "Notification created",
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/restricted/:id",
  [authProtect, adminProtect],
  async (req, res, next) => {
      try {
          const { id } = req.params;
        const user = await prisma.user.findUnique({
          where: { id: Number(id) },
        });

        if (!user) {
          return res.status(404).json({
            message: "User not found",
          });
        }
      await createNotification({
        userId: Number(id),
        title: "Restricted Access 🚫",
        message: "You have been restricted from creating books.",
      });
      console.log("Emitting notification to room:", String(id));

      getIO().to(String(id)).emit("notification", {
        title: "Restricted Access 🚫",
        message: "You have been restricted from creating books.",
      });
      console.log("✅ Notification emitted");
      try {
        await sendRestrictionEmail(user.email);
      } catch (err) {
        console.error("Restriction email failed:", err.message);
      }

      return res.json({
        message: "Notification created and email sent successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

router.patch("/:id/read", authProtect, async (req, res, next) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    if (notification.userId !== req.user.sub) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: req.params.id,
      },
      data: {
        isRead: true,
      },
    });

    return res.status(200).json(updatedNotification);
  } catch (error) {
    next(error);
  }
});

router.get("/unread-count", authProtect, async (req, res, next) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user.sub,
        isRead: false,
      },
    });

    return res.status(200).json({
      count,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
