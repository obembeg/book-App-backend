const crypto = require("crypto");
// import bcrypt from "bcrypt";
const prisma = require("../helper/prisma");
const argon = require("argon2");
const userSchema = require("../joiSchema/schema");


const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,

        resetPasswordExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token.",
      });
    }

    const hashedPassword = await argon.hash(password);

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        password: hashedPassword,

        resetPasswordToken: null,

        resetPasswordExpiresAt: null,
      },
    });

    return res.status(200).json({
      message: "Password reset successful.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = resetPassword;
