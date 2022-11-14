const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "User must have a first name"],
      maxlength: [20, "A user name must have less or equal to 20 characters"],
    },
    last_name: {
      type: String,
      required: [true, "User must have a last name"],
      maxlength: [20, "A user name must have less or equal to 20 characters"],
    },
    email: {
      type: String,
      required: [true, "User must have an email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "User must have a password"],
      minlength: [
        8,
        "A user password must have more or equal then 8 characters",
      ],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "User must have a passwordConfirm"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
userSchema.virtual("blogs", {
  ref: "Blog",
  foreignField: "author",
  localField: "_id",
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
const User = mongoose.model("User", userSchema);

module.exports = User;
