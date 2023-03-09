const { Schema, model } = require("mongoose");

const userSchema = Schema(
  {
    password: {
      type: String,
      required: [true, "Set password"],
      minlength: 6,
    },
    email: {
      type: String,
      required: [true, "Email is requiered"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
      default: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const User = model("user", userSchema);

module.exports = User;
