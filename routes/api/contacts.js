const express = require("express");
const router = express.Router();

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
} = require("../../controllers");
const { getCurrent } = require("../../middlewares");

router.get("/", getCurrent, listContacts);
router.get("/:contactId", getCurrent, getContactById);
router.post("/", getCurrent, addContact);
router.delete("/:contactId", getCurrent, removeContact);
router.put("/:contactId", getCurrent, updateContact);
router.patch("/:contactId/favorite", getCurrent, updateStatusContact);

module.exports = { contactsRouter: router };
