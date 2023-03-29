const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
} = require("./contacts");

const {
  register,
  verifyEmail,
  resendVerifyEmail,
  login,
  getCurrentUser,
  logout,
  updateSubscription,
  updateAvatar,
  deleteUserByEmail,
} = require("./users");

module.exports = {
  register,
  verifyEmail,
  resendVerifyEmail,
  login,
  getCurrentUser,
  logout,
  updateSubscription,
  updateAvatar,
  deleteUserByEmail,
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
