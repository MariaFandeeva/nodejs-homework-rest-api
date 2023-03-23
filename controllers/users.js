const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { uid } = require("uid");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");

const { SECRET_KEY } = process.env;
const { User } = require("../models");

const {
  userRegJoiSchema,
  userLoginJoiSchema,
  userUpdateJoiSchema,
} = require("../schemasJoi");

const register = async (req, res) => {
  const { error } = userRegJoiSchema(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request" });
  }
  const { email, password, subscription } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.status(409).json({ message: "Invalid email" });
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const result = await User.create({
    email,
    password: hashPassword,
    subscription,
    avatarURL,
  });
  res.status(201).json({ email, subscription, avatarURL });
};

const login = async (req, res) => {
  const { error } = userLoginJoiSchema(req.body);
  if (error || Object.keys(req.body) === 0) {
    return res.sign(400).json({ message: "Bad request" });
  }
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  const passCompare = await bcrypt.compare(password, user.password);
  if (!user || !passCompare) {
    return res.status(401).json({ message: "Bad request" });
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

const updateAvatar = async (req, res) => {
  const avatarDir = path.join(__dirname, "../", "public", "avatars");
  const { _id } = req.user;

  if (!req.file) {
    return res.status(400).json({ message: "Bad request" });
  }

  const { path: tempUpload, originalname } = req.file;
  const imageName = `${uid(8)}_${originalname}`;

  try {
    const imgProcessed = await Jimp.read(tempUpload);
    await imgProcessed
      .autocrop()
      .cover(
        250,
        250,
        Jimp.HORIZONTAL_ALIGN_CENTER || Jimp.VERTICAL_ALIGN_MIDDLE
      )
      .writeAsync(tempUpload);

    const resultUpload = path.join(avatarDir, imageName);
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("public", "avatars", imageName);
    await User.findByIdAndUpdate(_id, { avatarURL });
    res.status(200).json({ avatarURL });
  } catch (err) {
    await fs.unlink(tempUpload);
    throw err;
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  updateSubscription,
  updateAvatar,
};
