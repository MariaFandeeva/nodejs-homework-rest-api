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
  userVerifyJoiSchema,
  userLoginJoiSchema,
  userUpdateJoiSchema,
} = require("../schemasJoi");
const sendEmail = require("../helpers/sendEmail");

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
  const verificationToken = uid();
  const result = await User.create({
    email,
    password: hashPassword,
    subscription,
    avatarURL,
    verificationToken,
  });
  const mail = {
    to: email,
    subject: "Confirm verification",
    html: `<h1>Registretion succsess</h1>
    <p>Login: ${email}</p>
    <p>To confirm registration follow the link:</p>
    <a href="http://localhost:3001/api/users/verify/${verificationToken}" target="_black">Confirm</a>`,
  };
  await sendEmail(mail);
  res.status(201).json({ email, subscription, avatarURL });
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });
  res.status(200).json({ message: "Verification success" });
};

const resendVerifyEmail = async (req, res) => {
  const { error } = userVerifyJoiSchema(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request" });
  }
  const { email } = req.user;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "Not Found" });
  }
  if (user.verify) {
    return res.status(400).json({ message: "Verification already passed" });
  }
  const verificationToken = user.verificationToken;
  const mail = {
    to: email,
    subject: "Confirm varification",
    html: `<h1>Thank you fo registration</h1>
    <p>Your login: ${email}</p>
    <p>Follow the link to confirm registration:</p>
    <a href="http://localhost:3001/api/users/verify/${verificationToken}" target="_blank">Confirm</a>`,
  };
  await sendEmail(mail);
  res.status(200).json({ message: "Verification email sent" });
};

const login = async (req, res) => {
  const { error } = userLoginJoiSchema(req.body);
  if (error || Object.keys(req.body) === 0) {
    return res.status(400).json({ message: "Bad request" });
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
  const result = await User.findByIdAndUpdate(
    { _id, subscription },
    { new: true }
  );
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

const deleteUserByEmail = async (req, res) => {
  const { email } = req.query;
  const userToRemove = await User.deleteOne({ email });
  if (!userToRemove) {
    return res
      .status(404)
      .json({ message: `User with email:${email} not found` });
  } else {
    res.status(200).json({ message: "User deleted from data base" });
  }
};

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
};
