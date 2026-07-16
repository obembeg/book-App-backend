const prisma = require("../helper/prisma");

const createNotification = async ({ userId, title, message }) => {
  return await prisma.notification.create({
    data: {
      userId,
      title,
      message,
    },
  });
};

module.exports = {
  createNotification,
};
