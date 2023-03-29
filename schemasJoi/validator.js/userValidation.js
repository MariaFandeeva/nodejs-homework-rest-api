const Joi = require("joi");

const { validator } = require("../../middlewares");

const userRegSchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required,
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

const userLoginSchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required(),
});

const updateSubscription = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

const userRegJoiSchema = validator(userRegSchema);
const userVerifyJoiSchema = validator(verifyEmailSchema);
const userLoginJoiSchema = validator(userLoginSchema);
const userUpdateJoiSchema = validator(updateSubscription);

module.exports = {
  userRegJoiSchema,
  userVerifyJoiSchema,
  userLoginJoiSchema,
  userUpdateJoiSchema,
};
