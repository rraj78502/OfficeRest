const asyncHandler = require("../utils/asyncHandler");
const Branch = require("../model/branchModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const cloudinary = require("cloudinary").v2;

// Get all branches (public endpoint)
const getAllBranches = asyncHandler(async (req, res) => {
  const { includeInactive } = req.query;
  
  let query = {};
  if (!includeInactive || includeInactive !== "true") {
    query.isActive = true;
  }

  const branches = await Branch.find(query)
    .sort({ order: 1, name: 1 })
    .select("-createdBy -updatedBy");

  if (!branches || branches.length === 0) {
    throw new ApiError(404, "No branches found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, branches, "Branches retrieved successfully"));
});

// Get branch by slug (public endpoint)
const getBranchBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const branch = await Branch.findBySlug(slug);

  if (!branch) {
    throw new ApiError(404, "Branch not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, branch.getPublicData(), "Branch retrieved successfully"));
});

// Get branch by ID (admin endpoint)
const getBranchById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const branch = await Branch.findById(id)
    .populate("createdBy", "username email")
    .populate("updatedBy", "username email");

  if (!branch) {
    throw new ApiError(404, "Branch not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, branch, "Branch retrieved successfully"));
});

// Create new branch (admin only)
const createBranch = asyncHandler(async (req, res) => {
  let {
    name,
    address,
    mapLink,
    description,
    contact,
    workingHours,
    services,
    uniquePrograms,
    teamMembers,
    order
  } = req.body;

  // Handle multipart/form-data where complex fields arrive as JSON strings
  try {
    if (typeof contact === "string") contact = JSON.parse(contact);
  } catch (e) {
    throw new ApiError(400, "Invalid contact format");
  }
  try {
    if (typeof services === "string") services = JSON.parse(services);
  } catch (e) {
    throw new ApiError(400, "Invalid services format");
  }
  try {
    if (typeof uniquePrograms === "string") uniquePrograms = JSON.parse(uniquePrograms);
  } catch (e) {
    throw new ApiError(400, "Invalid uniquePrograms format");
  }
  try {
    if (typeof teamMembers === "string") teamMembers = JSON.parse(teamMembers);
  } catch (e) {
    throw new ApiError(400, "Invalid teamMembers format");
  }
  if (typeof order === "string") {
    const parsed = parseInt(order, 10);
    order = Number.isNaN(parsed) ? 0 : parsed;
  }

  // Validate required fields
  if (!name || !address || !mapLink || !description) {
    throw new ApiError(400, "Name, address, map link, and description are required");
  }

  if (!contact || !contact.phone || !contact.email) {
    throw new ApiError(400, "Contact phone and email are required");
  }

  // Check if branch with same name already exists
  const existingBranch = await Branch.findOne({ name: name.trim() });
  if (existingBranch) {
    throw new ApiError(400, "Branch with this name already exists");
  }

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

  // Check if slug already exists
  const existingSlug = await Branch.findOne({ slug });
  if (existingSlug) {
    throw new ApiError(400, "Branch slug already exists. Please use a different name.");
  }

  // Upload hero image if provided
  let heroImageUrl = "";
  if (req.files && req.files.heroImage) {
    try {
      const heroImageResult = await uploadOnCloudinary(
        req.files.heroImage[0].path,
        "Branch Images"
      );
      if (heroImageResult && heroImageResult.secure_url) {
        heroImageUrl = heroImageResult.secure_url;
      }
    } catch (error) {
      throw new ApiError(500, `Hero image upload failed: ${error.message}`);
    }
  }

  // Process team member profile pictures
  let processedTeamMembers = [];
  if (teamMembers && Array.isArray(teamMembers)) {
    processedTeamMembers = await Promise.all(
      teamMembers.map(async (member, index) => {
        let profilePicUrl = "";
        
        if (req.files && req.files[`teamMember_${index}_profilePic`]) {
          try {
            const profilePicResult = await uploadOnCloudinary(
              req.files[`teamMember_${index}_profilePic`][0].path,
              "Team Member Profiles"
            );
            if (profilePicResult && profilePicResult.secure_url) {
              profilePicUrl = profilePicResult.secure_url;
            }
          } catch (error) {
            console.error(`Team member ${index} profile pic upload failed:`, error);
          }
        }

        return {
          ...member,
          profilePic: profilePicUrl
        };
      })
    );
  }

  // Create branch
  // Sanitize programs: allow empty list and drop blank entries
  const sanitizedPrograms = Array.isArray(uniquePrograms)
    ? uniquePrograms
        .filter((p) => p && typeof p.title === 'string' && p.title.trim() && typeof p.description === 'string' && p.description.trim())
        .map((p) => ({
          title: p.title.trim(),
          description: p.description.trim(),
          schedule: typeof p.schedule === 'string' ? p.schedule.trim() : (p.schedule || ''),
        }))
    : [];

  // Sanitize services: allow empty list and drop blank entries
  const sanitizedServices = Array.isArray(services)
    ? services
        .filter((s) => s && typeof s.name === 'string' && s.name.trim() && typeof s.description === 'string' && s.description.trim())
        .map((s) => ({ name: s.name.trim(), description: s.description.trim() }))
    : [];

  const branch = await Branch.create({
    name: name.trim(),
    slug,
    address: address.trim(),
    mapLink: mapLink.trim(),
    description: description.trim(),
    contact: {
      phone: contact.phone.trim(),
      email: contact.email.trim().toLowerCase()
    },
    workingHours: workingHours || "Sunday - Friday: 10:00 AM - 5:00 PM",
    services: sanitizedServices,
    uniquePrograms: sanitizedPrograms,
    teamMembers: processedTeamMembers,
    heroImage: heroImageUrl,
    order: typeof order === "number" ? order : 0,
    createdBy: req.user._id
  });

  const createdBranch = await Branch.findById(branch._id)
    .populate("createdBy", "username email");

  return res
    .status(201)
    .json(new ApiResponse(201, createdBranch, "Branch created successfully"));
});

// Update branch (admin only)
const updateBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  // Parse JSON strings for multipart updates
  try {
    if (typeof updateData.contact === "string") updateData.contact = JSON.parse(updateData.contact);
  } catch (e) {
    throw new ApiError(400, "Invalid contact format");
  }
  try {
    if (typeof updateData.services === "string") updateData.services = JSON.parse(updateData.services);
  } catch (e) {
    throw new ApiError(400, "Invalid services format");
  }
  try {
    if (typeof updateData.uniquePrograms === "string") updateData.uniquePrograms = JSON.parse(updateData.uniquePrograms);
  } catch (e) {
    throw new ApiError(400, "Invalid uniquePrograms format");
  }
  try {
    if (typeof updateData.teamMembers === "string") updateData.teamMembers = JSON.parse(updateData.teamMembers);
  } catch (e) {
    throw new ApiError(400, "Invalid teamMembers format");
  }
  if (typeof updateData.order === "string") {
    const parsed = parseInt(updateData.order, 10);
    updateData.order = Number.isNaN(parsed) ? 0 : parsed;
  }

  const branch = await Branch.findById(id);
  if (!branch) {
    throw new ApiError(404, "Branch not found");
  }

  // Don't allow updating slug directly
  delete updateData.slug;
  delete updateData.createdBy;

  // If name is being updated, regenerate slug
  if (updateData.name && updateData.name !== branch.name) {
    const newSlug = updateData.name
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");
    
    // Check if new slug already exists
    const existingSlug = await Branch.findOne({ slug: newSlug, _id: { $ne: id } });
    if (existingSlug) {
      throw new ApiError(400, "Branch with this name already exists");
    }
    
    updateData.slug = newSlug;
  }

  // Handle hero image update
  if (req.files && req.files.heroImage) {
    try {
      // Delete old hero image if exists
      if (branch.heroImage) {
        const publicId = branch.heroImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`Branch Images/${publicId}`);
      }
      
      // Upload new hero image
      const heroImageResult = await uploadOnCloudinary(
        req.files.heroImage[0].path,
        "Branch Images"
      );
      if (heroImageResult && heroImageResult.secure_url) {
        updateData.heroImage = heroImageResult.secure_url;
      }
    } catch (error) {
      throw new ApiError(500, `Hero image upload failed: ${error.message}`);
    }
  }

  // Handle team member profile picture updates
  if (updateData.teamMembers && Array.isArray(updateData.teamMembers)) {
    updateData.teamMembers = await Promise.all(
      updateData.teamMembers.map(async (member, index) => {
        let profilePicUrl = member.profilePic || "";
        
        if (req.files && req.files[`teamMember_${index}_profilePic`]) {
          try {
            // Delete old profile pic if exists
            if (member.profilePic) {
              const publicId = member.profilePic.split("/").pop().split(".")[0];
              await cloudinary.uploader.destroy(`Team Member Profiles/${publicId}`);
            }
            
            // Upload new profile pic
            const profilePicResult = await uploadOnCloudinary(
              req.files[`teamMember_${index}_profilePic`][0].path,
              "Team Member Profiles"
            );
            if (profilePicResult && profilePicResult.secure_url) {
              profilePicUrl = profilePicResult.secure_url;
            }
          } catch (error) {
            console.error(`Team member ${index} profile pic upload failed:`, error);
          }
        }

        return {
          ...member,
          profilePic: profilePicUrl
        };
      })
    );
  }

  // Sanitize programs on update: permit empty array and drop blank entries
  if (Array.isArray(updateData.uniquePrograms)) {
    updateData.uniquePrograms = updateData.uniquePrograms
      .filter((p) => p && typeof p.title === 'string' && p.title.trim() && typeof p.description === 'string' && p.description.trim())
      .map((p) => ({
        title: p.title.trim(),
        description: p.description.trim(),
        schedule: typeof p.schedule === 'string' ? p.schedule.trim() : (p.schedule || ''),
      }));
  }

  // Sanitize services on update: permit empty array and drop blank entries
  if (Array.isArray(updateData.services)) {
    updateData.services = updateData.services
      .filter((s) => s && typeof s.name === 'string' && s.name.trim() && typeof s.description === 'string' && s.description.trim())
      .map((s) => ({ name: s.name.trim(), description: s.description.trim() }));
  }

  // Update branch
  updateData.updatedBy = req.user._id;
  const updatedBranch = await Branch.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate("createdBy updatedBy", "username email");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedBranch, "Branch updated successfully"));
});

// Delete branch (admin only)
const deleteBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const branch = await Branch.findById(id);
  if (!branch) {
    throw new ApiError(404, "Branch not found");
  }

  // Delete associated files from Cloudinary
  const deletionErrors = [];
  
  // Delete hero image
  if (branch.heroImage) {
    try {
      const publicId = branch.heroImage.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`Branch Images/${publicId}`);
    } catch (error) {
      if (!error.message.includes("not found")) {
        deletionErrors.push(`Failed to delete hero image: ${error.message}`);
      }
    }
  }

  // Delete team member profile pictures
  if (branch.teamMembers && branch.teamMembers.length > 0) {
    for (const member of branch.teamMembers) {
      if (member.profilePic) {
        try {
          const publicId = member.profilePic.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`Team Member Profiles/${publicId}`);
        } catch (error) {
          if (!error.message.includes("not found")) {
            deletionErrors.push(`Failed to delete team member profile pic: ${error.message}`);
          }
        }
      }
    }
  }

  if (deletionErrors.length > 0) {
    console.error("File deletion errors:", deletionErrors);
    // Log errors but don't fail the deletion
  }

  await Branch.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Branch deleted successfully"));
});

// Toggle branch active status (admin only)
const toggleBranchStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const branch = await Branch.findById(id);
  if (!branch) {
    throw new ApiError(404, "Branch not found");
  }

  branch.isActive = !branch.isActive;
  branch.updatedBy = req.user._id;
  await branch.save();

  const statusMessage = branch.isActive ? "activated" : "deactivated";

  return res
    .status(200)
    .json(new ApiResponse(200, branch, `Branch ${statusMessage} successfully`));
});

module.exports = {
  getAllBranches,
  getBranchBySlug,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  toggleBranchStatus,
};
