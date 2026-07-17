const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  logger: true,
  debug: true,
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Mail server connection failed:", error.message);
  } else {
    console.log("✅ Mail server is ready.");
  }
});


const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"OG Book Store 📚" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}`);
    throw error;
  }
};

const sendWelcomeEmail = async (email) => {
  await sendEmail({
    to: email,
    subject: "📚 Welcome to OG Book Store!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border:1px solid #ddd; border-radius:10px; overflow:hidden;">
        
        <div style="background:#2563eb; color:white; padding:20px; text-align:center;">
          <h1>📚 OG Book Store</h1>
        </div>

        <div style="padding:30px;">
          <h2>Welcome!</h2>

          <p>Thank you for joining <strong>OG Book Store</strong>.</p>

          <p>Your account has been created successfully.</p>

          <p>Discover books, organize your library and enjoy reading.</p>

          <div style="text-align:center; margin:30px 0;">
            <a href="${process.env.FRONTEND_URL}/login"
               style="background:#2563eb;
               color:white;
               padding:12px 24px;
               text-decoration:none;
               border-radius:5px;">
               Start Reading
            </a>
          </div>

          <p>If you didn't create this account, you can safely ignore this email.</p>

          <hr>

          <small>
          © 2026 OG Book Store. All rights reserved.
          </small>

        </div>

      </div>
    `,
  });
};

const sendRestrictionEmail = async (email) => {
  await sendEmail({
    to: email,
    subject: "Account Restricted",
    html: `
      <h2>Account Restricted</h2>

      <p>Your account has been temporarily restricted. This means you will no longer be able to create new books until restriction is lifted</p>

      <p>If you believe this is a mistake, contact support.</p>
    `,
  });
};


module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendRestrictionEmail,
};
