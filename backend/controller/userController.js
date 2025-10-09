const asyncHandler = require("../utils/asyncHandler");
const User = require("../model/userModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { sendOTPController, verifyOTPController } = require("./otpController");
const { v4: uuidv4 } = require("uuid");
const XLSX = require("xlsx");
const {validateUserFiles} = require("../utils/valiadateFiles");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");

const REQUIRED_MEMBER_FIELDS = [
  "employeeId",
  "username",
  "surname",
  "address",
  "province",
  "district",
  "municipality",
  "wardNumber",
  "tole",
  "telephoneNumber",
  "mobileNumber",
  "dob",
  "postAtRetirement",
  "pensionLeaseNumber",
  "office",
  "serviceStartDate",
  "serviceRetirementDate",
  "dateOfFillUp",
  "place",
  "email",
];

const sanitizeValue = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value.trim();
  return String(value).trim();
};

const generateMembershipIdentifiers = () => ({
  membershipNumber: `MEM-${uuidv4().slice(0, 8).toUpperCase()}`,
  registrationNumber: `REG-${uuidv4().slice(0, 8).toUpperCase()}`,
});

const generateRandomPassword = () => uuidv4().replace(/-/g, "").slice(0, 10);

// Generate refresh and access tokens
const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(
      500,
      "Something went wrong while generating access token and refresh token"
    );
  }
};

// Register a new user
const registerUserController = asyncHandler(async (req, res) => {
  const {
    employeeId,
    username,
    surname,
    address,
    province,
    district,
    municipality,
    wardNumber,
    tole,
    telephoneNumber,
    mobileNumber,
    dob,
    postAtRetirement,
    pensionLeaseNumber,
    office,
    serviceStartDate,
    serviceRetirementDate,
    dateOfFillUp,
    place,
    email,
    password,
  } = req.body;

  const requiredFields = {
    employeeId,
    username,
    surname,
    address,
    province,
    district,
    municipality,
    wardNumber,
    tole,
    telephoneNumber,
    mobileNumber,
    dob,
    postAtRetirement,
    pensionLeaseNumber,
    office,
    serviceStartDate,
    serviceRetirementDate,
    dateOfFillUp,
    place,
    email,
    password,
    membershipNumber: `MEM-${uuidv4().slice(0, 8).toUpperCase()}`,
    registrationNumber: `REG-${uuidv4().slice(0, 8).toUpperCase()}`,
  };

  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value && key !== "membershipNumber" && key !== "registrationNumber") {
      throw new ApiError(400, `Field '${key}' is required`);
    }
  }

  // Check for existing users with specific field validation
  const duplicateFields = [];
  
  const existingEmployeeId = await User.findOne({ employeeId });
  if (existingEmployeeId) duplicateFields.push("Employee ID");
  
  const existingEmail = await User.findOne({ email });
  if (existingEmail) duplicateFields.push("Email");
  
  const existingMobile = await User.findOne({ mobileNumber });
  if (existingMobile) duplicateFields.push("Mobile Number");

  if (duplicateFields.length > 0) {
    throw new ApiError(
      400,
      `User already exists with this ${duplicateFields.join(", ")}. Please use different ${duplicateFields.join(", ").toLowerCase()}.`
    );
  }

  // Validate file uploads
  validateUserFiles(req.files);

  // Upload profile picture to Cloudinary
  let profilePicUrl = "";
  try {
    const profilePicResult = await uploadOnCloudinary(
      req.files.profilePic[0].path,
      "User Profiles"
    );
    if (profilePicResult && profilePicResult.secure_url) {
      profilePicUrl = profilePicResult.secure_url;
    } else {
      throw new ApiError(500, "Failed to upload profile picture");
    }
  } catch (error) {
    throw new ApiError(500, `Profile picture upload failed: ${error.message}`);
  }

  // Upload additional file to Cloudinary (if provided)
  let files = [];
  if (req.files.additionalFile) {
    try {
      const fileResult = await uploadOnCloudinary(
        req.files.additionalFile[0].path,
        "User Files"
      );
      if (fileResult && fileResult.secure_url) {
        files.push({
          url: fileResult.secure_url,
          type: req.files.additionalFile[0].mimetype,
        });
      } else {
        throw new ApiError(500, "Failed to upload additional file");
      }
    } catch (error) {
      throw new ApiError(500, `Additional file upload failed: ${error.message}`);
    }
  }

  // Create user
  const user = await User.create({
    ...requiredFields,
    profilePic: profilePicUrl,
    files,
    membershipStatus: "pending",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(400, "Error while creating user");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

// Send OTP for login
const sendOTPVerificationLogin = asyncHandler(async (req, res) => {
  const { email, password, deliveryMethod } = req.body;

  if (!email || !password || !deliveryMethod) {
    throw new ApiError(400, "Email, password, and delivery method are required");
  }
  if (!["sms", "email"].includes(deliveryMethod)) {
    throw new ApiError(400, "Invalid delivery method. Use 'sms' or 'email'");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  if (req.headers["x-admin-frontend"] === "true" && user.role !== "admin") {
    throw new ApiError(403, "Not an admin user from this frontend");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password");
  }

  const identifier = deliveryMethod === "sms" ? user.mobileNumber : user.email;
  if (!identifier) {
    throw new ApiError(
      400,
      `User does not have a ${deliveryMethod === "sms" ? "mobile number" : "email"} registered`
    );
  }

  try {
    const { token, identifier: returnedIdentifier, deliveryMethod: returnedMethod, message } =
      await sendOTPController({
        identifier,
        deliveryMethod,
      });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { token, identifier: returnedIdentifier, deliveryMethod: returnedMethod },
          message
        )
      );
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to send OTP"
    );
  }
});

// Verify OTP and login
const verifyUserOTPLogin = asyncHandler(async (req, res) => {
  const { token, otp, deliveryMethod } = req.body;

  if (!token || !otp || !deliveryMethod) {
    throw new ApiError(400, "Token, OTP, and delivery method are required");
  }
  if (!["sms", "email"].includes(deliveryMethod)) {
    throw new ApiError(400, "Invalid delivery method. Use 'sms' or 'email'");
  }

  try {
    const { identifier, message } = await verifyOTPController({
      token,
      otp,
      deliveryMethod,
    });

    const user = await User.findOne(
      deliveryMethod === "sms" ? { mobileNumber: identifier } : { email: identifier }
    );
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (req.headers["x-admin-frontend"] === "true" && user.role !== "admin") {
      throw new ApiError(403, "This interface is for admin users only");
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
      httpOnly: true,
      secure: false, // Changed to false for HTTP
      sameSite: "Lax", // Changed to Lax for HTTP
    };

    console.log("Setting cookies:", { accessToken, refreshToken });

    return res
      .status(200)
      .cookie("accessToken", accessToken,
      options)
      .cookie("refreshToken",
      refreshToken,
      options)
      .json(
        new ApiResponse(
          200,
          { loggedInUser,
          accessToken,
          refreshToken },
          "User logged in successfully"
        )
      );
  } catch (error) {
    console.error("Error in verifyUserOTPLogin:", error);
    throw error;
  }
});

// Logout user
const logoutUserController = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new ApiError(400, "No refresh token found");
  }

  const user = await User.findOne({ refreshToken });
  if (user) {
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });
  }

  res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: false, // Match login cookie
      sameSite: "Lax", // Match login cookie
      path: "/", // Ensure path matches
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: false, // Match login cookie
      sameSite: "Lax", // Match login cookie
      path: "/", // Ensure path matches
    });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const lookupMemberByEmployeeId = asyncHandler(async (req, res) => {
  const { employeeId } = req.query;

  if (!employeeId || typeof employeeId !== "string" || !employeeId.trim()) {
    throw new ApiError(400, "employeeId query parameter is required");
  }

  const normalizedEmployeeId = employeeId.trim().toLowerCase();

  const user = await User.findOne({ employeeId: normalizedEmployeeId }).select(
    "username surname email mobileNumber membershipNumber registrationNumber employeeId profilePic membershipStatus role address province district municipality wardNumber tole"
  );

  if (!user) {
    throw new ApiError(404, "Member not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Member lookup successful"));
});

// Get all users
const getAllUsersController = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = status ? { membershipStatus: status } : {};
  const users = await User.find(query).select("-password -refreshToken");

  if (!users || users.length === 0) {
    throw new ApiError(404, "No users found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users retrieved successfully"));
});

// Get user by ID
const getUserByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User retrieved successfully"));
});

// Update user by ID
const updateUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  delete updateData.password;
  delete updateData.refreshToken;
  // delete updateData.role; // Allow role to be updated
  delete updateData.membershipNumber;
  delete updateData.registrationNumber;
  delete updateData.membershipStatus;

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Validate file uploads if provided
  if (req.files && (req.files.profilePic || req.files.additionalFile)) {
    validateUserFiles(req.files);

    // Update profile picture if provided
    if (req.files.profilePic) {
      try {
        // Delete old profile picture from Cloudinary if exists
        if (user.profilePic) {
          const publicId = user.profilePic.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`User Profiles/${publicId}`);
        }
        // Upload new profile picture
        const profilePicResult = await uploadOnCloudinary(
          req.files.profilePic[0].path,
          "User Profiles"
        );
        if (profilePicResult && profilePicResult.secure_url) {
          user.profilePic = profilePicResult.secure_url;
        } else {
          throw new ApiError(500, "Failed to upload profile picture");
        }
      } catch (error) {
        throw new ApiError(500, `Profile picture upload failed: ${error.message}`);
      }
    }

    // Update additional file if provided
    if (req.files.additionalFile) {
      try {
        // Delete old file from Cloudinary if exists
        if (user.files.length > 0) {
          const publicId = user.files[0].url.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`User Files/${publicId}`);
        }
        // Upload new file
        const fileResult = await uploadOnCloudinary(
          req.files.additionalFile[0].path,
          "User Files"
        );
        if (fileResult && fileResult.secure_url) {
          user.files = [
            {
              url: fileResult.secure_url,
              type: req.files.additionalFile[0].mimetype,
            },
          ];
        } else {
          throw new ApiError(500, "Failed to upload additional file");
        }
      } catch (error) {
        throw new ApiError(500, `Additional file upload failed: ${error.message}`);
      }
    }
  }

  // Update other fields
  Object.assign(user, updateData);
  await user.save({ validateBeforeSave: true });

  const updatedUser = await User.findById(id).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

// Delete user by ID
const deleteUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Delete files from Cloudinary
  const deletionErrors = [];
  if (user.profilePic) {
    try {
      const publicId = user.profilePic.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`User Profiles/${publicId}`);
    } catch (error) {
      if (!error.message.includes("not found")) {
        deletionErrors.push(`Failed to delete profile picture: ${error.message}`);
      }
    }
  }

  if (user.files.length > 0) {
    try {
      const publicId = user.files[0].url.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`User Files/${publicId}`);
    } catch (error) {
      if (!error.message.includes("not found")) {
        deletionErrors.push(`Failed to delete additional file: ${error.message}`);
      }
    }
  }

  if (deletionErrors.length > 0) {
    throw new ApiError(
      500,
      `Some files could not be deleted: ${deletionErrors.join("; ")}`
    );
  }

  await User.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

// Approve membership
const approveMembershipController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.membershipStatus !== "pending") {
    throw new ApiError(400, "Membership is not pending");
  }
  user.membershipStatus = "approved";
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Membership approved successfully"));
});

// Check field availability
const checkFieldAvailabilityController = asyncHandler(async (req, res) => {
  const { field, value } = req.query;

  if (!field || !value) {
    throw new ApiError(400, "Field and value are required");
  }

  const allowedFields = ["employeeId", "email", "mobileNumber"];
  if (!allowedFields.includes(field)) {
    throw new ApiError(400, `Invalid field. Allowed fields: ${allowedFields.join(", ")}`);
  }

  const query = { [field]: value.toLowerCase().trim() };
  const existingUser = await User.findOne(query);

  const isAvailable = !existingUser;
  const fieldDisplayName = {
    employeeId: "Employee ID",
    email: "Email",
    mobileNumber: "Mobile Number"
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      { 
        isAvailable,
        field: fieldDisplayName[field],
        message: isAvailable 
          ? `${fieldDisplayName[field]} is available` 
          : `${fieldDisplayName[field]} is already taken`
      },
      isAvailable ? "Field is available" : "Field is not available"
    )
  );
});

// Decline membership
const declineMembershipController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.membershipStatus !== "pending") {
    throw new ApiError(400, "Membership is not pending");
  }

  // Delete files from Cloudinary
  const deletionErrors = [];
  if (user.profilePic) {
    try {
      const publicId = user.profilePic.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`User Profiles/${publicId}`);
    } catch (error) {
      if (!error.message.includes("not found")) {
        deletionErrors.push(`Failed to delete profile picture: ${error.message}`);
      }
    }
  }

  if (user.files.length > 0) {
    try {
      const publicId = user.files[0].url.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`User Files/${publicId}`);
    } catch (error) {
      if (!error.message.includes("not found")) {
        deletionErrors.push(`Failed to delete additional file: ${error.message}`);
      }
    }
  }

  if (deletionErrors.length > 0) {
    throw new ApiError(
      500,
      `Some files could not be deleted: ${deletionErrors.join("; ")}`
    );
  }

  await User.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Membership declined and user deleted successfully"));
});

const bulkImportMembersController = asyncHandler(async (req, res) => {
  const { members } = req.body;

  if (!Array.isArray(members) || members.length === 0) {
    throw new ApiError(400, "No members provided for import");
  }

  const successes = [];
  const failures = [];

  for (let index = 0; index < members.length; index += 1) {
    const rawMember = members[index] || {};

    try {
      const sanitizedMember = {};
      for (const key of Object.keys(rawMember || {})) {
        sanitizedMember[key] = sanitizeValue(rawMember[key]);
      }

      const missingFields = REQUIRED_MEMBER_FIELDS.filter(
        (field) => !sanitizeValue(sanitizedMember[field])
      );
      if (missingFields.length > 0) {
        throw new ApiError(
          400,
          `Missing required fields: ${missingFields.join(", ")}`
        );
      }

      const password = sanitizeValue(sanitizedMember.password) || generateRandomPassword();
      const normalizedRole = sanitizeValue(sanitizedMember.role).toLowerCase();
      const role = ["user", "admin"].includes(normalizedRole)
        ? normalizedRole
        : "user";
      const normalizedStatus = sanitizeValue(sanitizedMember.membershipStatus).toLowerCase();
      const membershipStatus = ["pending", "approved"].includes(normalizedStatus)
        ? normalizedStatus
        : "pending";

      const identifiers = generateMembershipIdentifiers();

      const user = new User({
        employeeId: sanitizeValue(sanitizedMember.employeeId).toLowerCase(),
        username: sanitizeValue(sanitizedMember.username),
        surname: sanitizeValue(sanitizedMember.surname),
        address: sanitizeValue(sanitizedMember.address),
        province: sanitizeValue(sanitizedMember.province),
        district: sanitizeValue(sanitizedMember.district),
        municipality: sanitizeValue(sanitizedMember.municipality),
        wardNumber: sanitizeValue(sanitizedMember.wardNumber),
        tole: sanitizeValue(sanitizedMember.tole),
        telephoneNumber: sanitizeValue(sanitizedMember.telephoneNumber),
        mobileNumber: sanitizeValue(sanitizedMember.mobileNumber),
        dob: sanitizeValue(sanitizedMember.dob),
        postAtRetirement: sanitizeValue(sanitizedMember.postAtRetirement),
        pensionLeaseNumber: sanitizeValue(sanitizedMember.pensionLeaseNumber),
        office: sanitizeValue(sanitizedMember.office),
        serviceStartDate: sanitizeValue(sanitizedMember.serviceStartDate),
        serviceRetirementDate: sanitizeValue(sanitizedMember.serviceRetirementDate),
        dateOfFillUp: sanitizeValue(sanitizedMember.dateOfFillUp),
        place: sanitizeValue(sanitizedMember.place),
        email: sanitizeValue(sanitizedMember.email).toLowerCase(),
        role,
        membershipNumber: identifiers.membershipNumber,
        registrationNumber: identifiers.registrationNumber,
        membershipStatus,
        password,
        profilePic: sanitizeValue(sanitizedMember.profilePic),
        files: [],
      });

      await user.save();

      successes.push({
        index,
        employeeId: user.employeeId,
        email: user.email,
        id: user._id,
      });
    } catch (error) {
      let message = error.message || "Unknown error";
      if (error?.code === 11000 && error?.keyValue) {
        const duplicateFields = Object.keys(error.keyValue).join(", ");
        message = `Duplicate value for ${duplicateFields}`;
      }
      failures.push({ index, reason: message });
    }
  }

  return res.status(200).json(
    new ApiResponse(200, {
      imported: successes.length,
      failed: failures.length,
      successes,
      failures,
    }, "Bulk import processed")
  );
});

const exportMembersController = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};

  if (status && status !== "all") {
    filter.membershipStatus = status;
  }

  const members = await User.find(filter).lean();

  const exportRows = members.map((member) => ({
    "Employee ID": member.employeeId,
    Name: `${member.username || ""} ${member.surname || ""}`.trim(),
    Email: member.email,
    Mobile: member.mobileNumber,
    Telephone: member.telephoneNumber,
    Province: member.province,
    District: member.district,
    Municipality: member.municipality,
    Ward: member.wardNumber,
    Tole: member.tole,
    "Post at Retirement": member.postAtRetirement,
    "Pension Lease Number": member.pensionLeaseNumber,
    Office: member.office,
    "Service Start Date": member.serviceStartDate,
    "Service Retirement Date": member.serviceRetirementDate,
    "Date Of Fill Up": member.dateOfFillUp,
    Place: member.place,
    "Membership Number": member.membershipNumber,
    "Registration Number": member.registrationNumber,
    Role: member.role,
    Status: member.membershipStatus,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Members");

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=members_export.xlsx"
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  return res.status(200).send(buffer);
});

module.exports = {
  registerUserController,
  generateAccessTokenAndRefreshToken,
  sendOTPVerificationLogin,
  verifyUserOTPLogin,
  logoutUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
  approveMembershipController,
  checkFieldAvailabilityController,
  declineMembershipController,
  lookupMemberByEmployeeId,
  bulkImportMembersController,
  exportMembersController,
  // Forgot/Reset password controllers
  requestPasswordReset: asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    // Find user by email
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      // Avoid user enumeration; respond success generically
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "If the account exists, an OTP has been sent"));
    }

    const enableEmailFallback = process.env.ENABLE_SMS_FALLBACK_TO_EMAIL === 'true' || (process.env.NODE_ENV !== 'production');

    // Prefer SMS in production when mobile is available; allow email fallback in dev or when enabled
    if (user.mobileNumber) {
      try {
        const { token, message } = await sendOTPController({
          identifier: user.mobileNumber,
          deliveryMethod: "sms",
        });
  
        return res.status(200).json(
          new ApiResponse(200, { token, deliveryMethod: "sms" }, message || "OTP sent via SMS")
        );
      } catch (error) {
        if (enableEmailFallback && user.email) {
          // Fallback to email OTP
          const { token, message } = await sendOTPController({
            identifier: user.email,
            deliveryMethod: "email",
          });
          return res.status(200).json(
            new ApiResponse(200, { token, deliveryMethod: "email" }, message || "OTP sent via Email")
          );
        }
        const msg = error?.message || "Unable to send OTP via SMS";
        throw new ApiError(503, msg);
      }
    }

    // If no mobile number, use email when allowed
    if (enableEmailFallback && user.email) {
      const { token, message } = await sendOTPController({
        identifier: user.email,
        deliveryMethod: "email",
      });
      return res.status(200).json(
        new ApiResponse(200, { token, deliveryMethod: "email" }, message || "OTP sent via Email")
      );
    }

    // Otherwise, fail clearly
    throw new ApiError(400, "No mobile number on file for this account");
  }),

  verifyPasswordResetOTP: asyncHandler(async (req, res) => {
    const { token, otp } = req.body;
    if (!token || !otp) {
      throw new ApiError(400, "Token and OTP are required");
    }

    const { identifier } = await verifyOTPController({ token, otp, deliveryMethod: "sms" });
    if (!identifier) {
      throw new ApiError(400, "OTP verification failed");
    }

    // Find user by verified mobile number
    const user = await User.findOne({ mobileNumber: identifier });
    if (!user) {
      throw new ApiError(404, "User not found for verified mobile number");
    }

    // Issue short-lived reset token
    const resetToken = jwt.sign(
      { uid: user._id.toString(), purpose: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, { resetToken }, "OTP verified. Proceed to reset password."));
  }),

  resetPasswordController: asyncHandler(async (req, res) => {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      throw new ApiError(400, "Reset token and new password are required");
    }

    // Verify token
    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      throw new ApiError(401, "Invalid or expired reset token");
    }
    if (!payload || payload.purpose !== "password_reset" || !payload.uid) {
      throw new ApiError(401, "Invalid reset token");
    }

    const user = await User.findById(payload.uid);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.password = newPassword;
    // Clearing refresh token is optional; can force re-login everywhere
    user.refreshToken = null;
    await user.save({ validateBeforeSave: true });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password reset successful. Please log in."));
  }),
};
