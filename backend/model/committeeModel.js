const mongoose = require("mongoose");

const committeeMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: [
        "Chairman",
        "Vice Chairman",
        "Secretary",
        "Treasurer",
        "Assistant Secretary",
        "Member",
        "Advisor",
      ],
    },
    bio: {
      type: String,
      trim: true,
    },
    committeeTitle: {
      type: String,
      trim: true,
    },
    startDate: {
      type: String, // e.g., "2064/4/16"
    },
    endDate: {
      type: String, // e.g., "2065/5/27" or "Current"
    },
    profilePic: {
      type: String, // URL for profile picture (Cloudinary)
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

const CommitteeMember = mongoose.model("CommitteeMember", committeeMemberSchema);
module.exports = CommitteeMember;
