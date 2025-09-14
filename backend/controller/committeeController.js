const asyncHandler = require("../utils/asyncHandler");
const CommitteeMember = require("../model/committeeModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const cloudinary = require("cloudinary").v2;

function escapeRegex(text) {
  return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

// Create a new committee member
const createCommitteeMember = asyncHandler(async (req, res) => {
  const { name, role, bio, committeeTitle, startDate, endDate, userId } = req.body;

  // Validate required fields
  const requiredFields = { name, role, bio, committeeTitle, startDate, endDate };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      throw new ApiError(400, `Field '${key}' is required`);
    }
  }

  // Validate userId if provided
  if (userId) {
    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new ApiError(404, "Associated user not found");
    }
  }

  // Upload profile picture to Cloudinary (if provided)
  let profilePicUrl = "";
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

  // Create committee member
  const committeeMember = await CommitteeMember.create({
    name,
    role,
    bio,
    committeeTitle,
    startDate,
    endDate,
    profilePic: profilePicUrl,
    userId: userId || null,
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
    select: "username email",
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
  const committeeMember = await CommitteeMember.findById(id).populate("userId", "username email");

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

  // Validate userId if provided
  if (userId) {
    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new ApiError(404, "Associated user not found");
    }
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

  // Update fields
  committeeMember.name = name || committeeMember.name;
  committeeMember.role = role || committeeMember.role;
  committeeMember.bio = bio || committeeMember.bio;
  committeeMember.committeeTitle = committeeTitle || committeeMember.committeeTitle;
  committeeMember.startDate = startDate || committeeMember.startDate;
  committeeMember.endDate = endDate || committeeMember.endDate;
  committeeMember.userId = userId !== undefined ? userId : committeeMember.userId;

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
