const { Contact } = require("../models");

const { HttpError, ctrlWrapper } = require("../middlewares");

const {
  contactPostValidator,
  contactPutValidator,
  favoriteJoiSchema,
} = require("../schemasJoi");

const listContacts = async (req, res) => {
  const { _id } = req.user;
  const { page = 1, limit = 20, favorite, name, phone } = req.query;
  const skip = (page - 1) * limit;

  const searchParams = { owner: _id };

  if (favorite) {
    searchParams.favorite = favorite;
  }

  if (name) {
    searchParams.name = name;
  }

  if (phone) {
    searchParams.phone = phone;
  }

  const result = await Contact.find(searchParams)
    .skip(skip)
    .limit(Number(limit))
    .sort("name")
    .populate("owner", "_id email subscription");
  return res.status(200).json(result);
};

const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await Contact.findById(contactId);

  if (!contact) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json(contact);
};

const removeContact = async (req, res) => {
  const { contactId } = req.params;
  const contactToRemove = await Contact.findByIdAndRemove(contactId);
  if (!contactToRemove) {
    res.status(404).json({ message: "Contact not found" });
  }
  res.status(200).json({ message: "Contact removed" });
};

const addContact = async (req, res) => {
  const { error } = contactPostValidator(req.body);
  if (error) return res.status(400).json({ message: "missing required field" });
  const { _id } = req.user;
  const { name, email, phone, favorite } = req.body;
  const contact = await Contact.create({
    name,
    email,
    phone,
    favorite,
    owner: _id,
  });
  if (contact) return res.status(201).json(contact);
};

const updateContact = async (req, res) => {
  const { error } = contactPutValidator(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const { contactId } = req.params;
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ message: "fill in all fields" });
  }
  const contact = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });
  if (contact) {
    res.status(200).json(contact);
  } else {
    res.status(404).json({ message: "Not found" });
  }
};

const updateStatusContact = async (req, res) => {
  const { contactId } = req.params;
  const { error } = favoriteJoiSchema(req.body);

  if (error) {
    res.status(400).json({ message: "missing field favorite" });
  }
  const { favorite } = req.body;
  const result = await Contact.findByIdAndUpdate(
    contactId,
    { favorite },
    {
      new: true,
    }
  );
  if (!result) {
    return res.status(404).json({ message: "Not found contact" });
  }
  return res.status(200).json(result);
};

module.exports = {
  listContacts: ctrlWrapper(listContacts),
  getContactById: ctrlWrapper(getContactById),
  removeContact: ctrlWrapper(removeContact),
  addContact: ctrlWrapper(addContact),
  updateContact: ctrlWrapper(updateContact),
  updateStatusContact: ctrlWrapper(updateStatusContact),
};
