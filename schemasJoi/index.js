const {
  contactPostValidator,
  contactPutValidator,
  favoriteJoiSchema,
} = require("./validator.js/contactsValidation");

const {
  userRegJoiSchema,
  userVerifyJoiSchema,
  userLoginJoiSchema,
  userUpdateSchema,
} = require("./validator.js/userValidation");

module.exports = {
  contactPostValidator,
  contactPutValidator,
  favoriteJoiSchema,
  userRegJoiSchema,
  userVerifyJoiSchema,
  userLoginJoiSchema,
  userUpdateSchema,
};
