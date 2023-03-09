const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = process.env;
const { HttpError } = require("../middlewares");
const { User } = require("../models");

const {
  userRegJoiSchema,
  userLoginJoiSchema,
  userUpdateJoiSchema,
} = require("../schemasJoi");

const register = async (req, res) => {
  const { error } = userRegJoiSchema(req.body);
  if (error) {
    throw HttpError(400, "Bad request");
  }
  const { email, password, subscription } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Invalid email");
  }
  const hashPassword = await bcrypt.hash(password, bcrypt.genSaltSync(10));
  const result = await User.create({
    email,
    password: hashPassword,
    subscription,
  });
  res.status(201).json({ email, subscription });
};

const login = async (req, res) => {
  const { error } = userLoginJoiSchema(req.body);
  if (error) {
    throw HttpError(400, "Bad request");
  }
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  const passCompare = await bcrypt.compare(password, user.password);
  if (!user || !passCompare) {
    throw HttpError(401, "Bad request");
  }
  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "12h" });
  await User.findByIdAndUpdate(user._id, { token });
  res
    .status(200)
    .json({ token, user: { email, subscription: user.subscription } });
};

const getCurrentUser = async (req, res) => {
  const { email, subscription } = req.user;
  res.status(200).json({ email, subscription });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).json({ message: "Log out" });
};

const updateSubscription = async (req, res) => {
  const { _id, email } = req.user;
  const { error } = userUpdateJoiSchema(req.body);

  if (error) {
    res.status(400).json({ message: "Bad request" });
  }
  const { subscription } = req.body;
  const result = await User.updateOne({ _id, subscription }, { new: true });
  if (!result) {
    return res.status(404).json({ message: "Not found" });
  }
  return res.status(200).json({
    user: {
      _id,
      email,
      subscription,
    },
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  updateSubscription,
};
