const crypto = require("crypto");
const prisma = require("../helper/prisma");

// const nodemailer = require("nodemailer");
const { sendEmail } = require("../services/mailService");

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    
    if (!user) {
        return res.status(200).json({
            message: "If an account exists, a password reset link has been sent.",
        });
    }
    
    if (user.password === null) {
    return res.status(200).json({
      message: "This account is registered via Google. Please use Google login to access your account.",
    });
  }
    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    //   },
    // });

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    try {
      await sendEmail({
        to: email,
        subject: "Password Reset",
        html: `
                <h2>Password Reset</h2>

                <p>Click below to reset your password.</p>

                <a href="${resetLink}">
                    Reset Password
                </a>

                <p>This link expires in 10 minutes.</p>
            `,
      });
    } catch (err) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordExpiresAt: null,
        },
      });

      throw err;
    }
    return res.status(200).json({
      message: "Reset link sent.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = forgotPassword;
