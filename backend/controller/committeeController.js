const asyncHandler = require("../utils/asyncHandler");
const CommitteeMember = require("../model/committeeModel");
const User = require("../model/userModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const cloudinary = require("cloudinary").v2;

function escapeRegex(text) {
  return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

function buildMemberDisplayName(userDoc) {
  const parts = [userDoc?.username, userDoc?.surname].filter(Boolean);
  const joined = parts.join(" ").trim();
  return joined || userDoc?.email || "";
}

// Create a new committee member
const createCommitteeMember = asyncHandler(async (req, res) => {
  const { name, role, bio, committeeTitle, startDate, endDate, userId } = req.body;

  const requiredFields = { role, bio, committeeTitle, startDate, endDate, userId };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      throw new ApiError(400, `Field '${key}' is required`);
    }
  }

  const normalizedRole = typeof role === "string" ? role.trim() : "";
  const normalizedBio = typeof bio === "string" ? bio.trim() : "";
  const normalizedCommitteeTitle = typeof committeeTitle === "string" ? committeeTitle.trim() : "";
  const normalizedStartDate = typeof startDate === "string" ? startDate.trim() : "";
  const normalizedEndDate = typeof endDate === "string" ? endDate.trim() : "";

  if (!normalizedRole || !normalizedBio || !normalizedCommitteeTitle || !normalizedStartDate || !normalizedEndDate) {
    throw new ApiError(400, "Committee member details are incomplete");
  }

  const linkedUser = await User.findById(userId).select(
    "username surname email profilePic membershipStatus"
  );
  if (!linkedUser) {
    throw new ApiError(404, "Linked member not found");
  }
  if (linkedUser.membershipStatus !== "approved") {
    throw new ApiError(400, "Member must be approved before being assigned to a committee");
  }

  // Upload profile picture to Cloudinary (if provided)
  let profilePicUrl = linkedUser.profilePic || "";
  if (req.files && req.files.profilePic) {
    try {
      const profilePicResult = await uploadOnCloudinary(
        req.files.profilePic[0].path,
        "Committee Profiles"
      );
      if (profilePicResult && profilePicResult.secure_url) {
        profilePicUrl = profilePicResult.secure_url;
      } else {
        throw new ApiError(500, "Failed to upload profile picture");
      }
    } catch (error) {
      throw new ApiError(500, `Profile picture upload failed: ${error.message}`);
    }
  }

  const committeeMember = await CommitteeMember.create({
    name: (typeof name === "string" && name.trim()) || buildMemberDisplayName(linkedUser),
    role: normalizedRole,
    bio: normalizedBio,
    committeeTitle: normalizedCommitteeTitle,
    startDate: normalizedStartDate,
    endDate: normalizedEndDate,
    profilePic: profilePicUrl,
    userId: linkedUser._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, committeeMember, "Committee member created successfully"));
});

// Get all committee members
const getAllCommitteeMembers = asyncHandler(async (req, res) => {
  const { committeeTitle } = req.query;
  console.log("Query committeeTitle:", committeeTitle);

  let query = {};
  if (committeeTitle && committeeTitle !== "All Years") {
    const safeTitle = escapeRegex(committeeTitle.trim());
    query = { committeeTitle: { $regex: `^${safeTitle}$`, $options: "i" } };
  }

  const committeeMembers = await CommitteeMember.find(query).populate({
    path: "userId",
    select: "username surname email membershipNumber profilePic membershipStatus",
    options: { strictPopulate: false }
  });

  console.log("Found members:", committeeMembers.length, "for query:", query);

  if (!committeeMembers || committeeMembers.length === 0) {
    throw new ApiError(404, `No committee members found for title: ${committeeTitle || "all"}`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, committeeMembers, "Committee members retrieved successfully"));
});
// Get committee member by ID
const getCommitteeMemberById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const committeeMember = await CommitteeMember.findById(id).populate(
    "userId",
    "username surname email membershipNumber profilePic membershipStatus"
  );

  if (!committeeMember) {
    throw new ApiError(404, "Committee member not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, committeeMember, "Committee member retrieved successfully"));
});

// Update committee member
const updateCommitteeMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, role, bio, committeeTitle, startDate, endDate, userId } = req.body;

  const committeeMember = await CommitteeMember.findById(id);
  if (!committeeMember) {
    throw new ApiError(404, "Committee member not found");
  }

  const targetUserId = userId || committeeMember.userId?.toString();
  if (!targetUserId) {
    throw new ApiError(400, "Linked member is required");
  }

  const linkedUser = await User.findById(targetUserId).select(
    "username surname email profilePic membershipStatus"
  );
  if (!linkedUser) {
    throw new ApiError(404, "Linked member not found");
  }
  if (linkedUser.membershipStatus !== "approved") {
    throw new ApiError(400, "Member must be approved before being assigned to a committee");
  }

  // Update profile picture if provided
  if (req.files && req.files.profilePic) {
    try {
      // Delete old profile picture from Cloudinary if exists
      if (committeeMember.profilePic) {
        const publicId = committeeMember.profilePic.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`Committee Profiles/${publicId}`);
      }
      // Upload new profile picture
      const profilePicResult = await uploadOnCloudinary(
        req.files.profilePic[0].path,
        "Committee Profiles"
      );
      if (profilePicResult && profilePicResult.secure_url) {
        committeeMember.profilePic = profilePicResult.secure_url;
      } else {
        throw new ApiError(500, "Failed to upload profile picture");
      }
    } catch (error) {
      throw new ApiError(500, `Profile picture upload failed: ${error.message}`);
    }
  }

  if (!req.files?.profilePic && !committeeMember.profilePic && linkedUser.profilePic) {
    committeeMember.profilePic = linkedUser.profilePic;
  }

  // Update fields
  committeeMember.userId = linkedUser._id;
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedRole = typeof role === "string" ? role.trim() : null;
  const normalizedBio = typeof bio === "string" ? bio.trim() : null;
  const normalizedCommitteeTitle = typeof committeeTitle === "string" ? committeeTitle.trim() : null;
  const normalizedStartDate = typeof startDate === "string" ? startDate.trim() : null;
  const normalizedEndDate = typeof endDate === "string" ? endDate.trim() : null;

  committeeMember.name = normalizedName || buildMemberDisplayName(linkedUser);
  if (normalizedRole) committeeMember.role = normalizedRole;
  if (normalizedBio) committeeMember.bio = normalizedBio;
  if (normalizedCommitteeTitle) committeeMember.committeeTitle = normalizedCommitteeTitle;
  if (normalizedStartDate) committeeMember.startDate = normalizedStartDate;
  if (normalizedEndDate) committeeMember.endDate = normalizedEndDate;

  await committeeMember.save();

  return res
    .status(200)
    .json(new ApiResponse(200, committeeMember, "Committee member updated successfully"));
});

// Delete committee member
const deleteCommitteeMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const committeeMember = await CommitteeMember.findById(id);

  if (!committeeMember) {
    throw new ApiError(404, "Committee member not found");
  }

  // Delete profile picture from Cloudinary if exists
  if (committeeMember.profilePic) {
    try {
      const publicId = committeeMember.profilePic.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`Committee Profiles/${publicId}`);
    } catch (error) {
      if (!error.message.includes("not found")) {
        throw new ApiError(500, `Failed to delete profile picture: ${error.message}`);
      }
    }
  }

  await CommitteeMember.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Committee member deleted successfully"));
});
const getCommitteeTitles = asyncHandler(async (req, res) => {
  const titles = await CommitteeMember.distinct("committeeTitle");
  if (!titles || titles.length === 0) {
    throw new ApiError(404, "No committee titles found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, titles, "Committee titles retrieved successfully"));
})

module.exports = {
  createCommitteeMember,
  getAllCommitteeMembers,
  getCommitteeMemberById,
  updateCommitteeMember,
  deleteCommitteeMember,    
  getCommitteeTitles,
};
