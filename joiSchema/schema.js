const { text } = require("express");
const Joi = require("joi");
const joiPwd = require("joi-password-complexity");

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  isAdmin: Joi.boolean(),
  isAllowed: Joi.boolean(),
});
const profileSchema = Joi.object({
  fullName: Joi.string().required(),
  bio: Joi.string().required(),
});

const complexityOptions = {
  min: 6,
  max: 30,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  symbol: 1,
  requirementCount: 4,
};

module.exports.userVal = userSchema;
module.exports.pVal = joiPwd(complexityOptions);
module.exports.profileVal = profileSchema;
