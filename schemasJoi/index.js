const {
  contactPostValidator,
  contactPutValidator,
  favoriteJoiSchema,
} = require("./validator.js/contactsValidation");

const {
  userRegJoiSchema,
  userLoginJoiSchema,
  userUpdateSchema,
} = require("./validator.js/userValidation");

module.exports = {
  contactPostValidator,
  contactPutValidator,
  favoriteJoiSchema,
  userRegJoiSchema,
  userLoginJoiSchema,
  userUpdateSchema,
};
