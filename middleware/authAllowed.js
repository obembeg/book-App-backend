const checkAllowed = (req, res, next) => {
  if (req.user.isAllowed === false) {
    return res
      .status(403)
      .json({ message: "Access denied. You cannot do this, contact admin." });
  }
  next();
};

module.exports = checkAllowed;
