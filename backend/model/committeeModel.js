const mongoose = require("mongoose");

const committeeMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
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
      required: [true, "Bio is required"],
      trim: true,
    },
    committeeTitle: {
      type: String,
      required: [true, "Committee title is required"],
      trim: true,
    },
    startDate: {
      type: String, // e.g., "2064/4/16"
      required: [true, "Start date is required"],
    },
    endDate: {
      type: String, // e.g., "2065/5/27" or "Current"
      required: [true, "End date is required"],
    },
    profilePic: {
      type: String, // URL for profile picture (Cloudinary)
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Optional: Link to a user if the member is a registered user
    },
  },
  { timestamps: true }
);

const CommitteeMember = mongoose.model("CommitteeMember", committeeMemberSchema);
module.exports = CommitteeMember;
