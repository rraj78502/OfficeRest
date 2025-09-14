const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    surname: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    province: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    municipality: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    wardNumber: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    tole: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    telephoneNumber: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    dob: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    postAtRetirement: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    pensionLeaseNumber: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    office: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    serviceStartDate: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    serviceRetirementDate: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    membershipNumber: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    dateOfFillUp: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    place: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
      membershipStatus: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
    refreshToken: {
      type: String,
    },
    profilePic: {
      type: String, // URL for profile picture
      default: "", // Optional, can be empty
    },
    files: {
      type: [
        {
          url: { type: String, required: true },
          type: { type: String, required: true },
        },
      ],
      validate: {
        validator: function (value) {
          return value.length <= 1; // Max 1 additional file
        },
        message: "You can only upload up to 1 additional file",
      },
      default: [], // Optional, can be empty
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

const User = mongoose.model("User", userSchema);
module.exports = User;