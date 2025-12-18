const express = require("express");
const {
  registerUserController,
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
} = require("../controller/userController");
const verifyJWT = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/verifyAdmin");
const upload = require("../middleware/multer");
const ApiResponse= require("../utils/ApiResponse");

const router = express.Router();

// Public routes
router.post(
  "/register",
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "additionalFile", maxCount: 1 },
  ]),
  registerUserController
);
router.post("/send-otp", sendOTPVerificationLogin);
router.post("/verify-otp", verifyUserOTPLogin);
// Forgot/Reset password (SMS OTP required)
router.post("/forgot-password/request", async (req, res, next) => {
  try {
    const { requestPasswordReset } = require("../controller/userController");
    await requestPasswordReset(req, res, next);
  } catch (err) {
    next(err);
  }
});
router.post("/forgot-password/verify", async (req, res, next) => {
  try {
    const { verifyPasswordResetOTP } = require("../controller/userController");
    await verifyPasswordResetOTP(req, res, next);
  } catch (err) {
    next(err);
  }
});
router.post("/forgot-password/reset", async (req, res, next) => {
  try {
    const { resetPasswordController } = require("../controller/userController");
    await resetPasswordController(req, res, next);
  } catch (err) {
    next(err);
  }
});
router.get("/check-availability", checkFieldAvailabilityController);
router.get("/lookup", verifyJWT, verifyAdmin, lookupMemberByEmployeeId);
router.post("/bulk-import", verifyJWT, verifyAdmin, bulkImportMembersController);
router.get("/export", verifyJWT, verifyAdmin, exportMembersController);

// Protected routes
router.post("/logout", logoutUserController);

router.get("/check-auth", verifyJWT, async (req, res) => {
  console.log("Check-auth user:", req.user || "No user");
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "No authenticated user found",
      statusCode: 401,
    });
  }
  return res.status(200).json(
    new ApiResponse(
      200,
      req.user,
      "User is authenticated"
    )
  );
});

// Admin-only routes
router.get("/get-all-users", verifyJWT, verifyAdmin, getAllUsersController);
router.delete("/delete-user/:id", verifyJWT, verifyAdmin, deleteUserController);
router.post("/approve-membership/:id", verifyJWT, verifyAdmin, approveMembershipController);
router.post("/decline-membership/:id", verifyJWT, verifyAdmin, declineMembershipController);

// Authenticated user routes
router.get("/get-user/:id", verifyJWT, getUserByIdController);
router.patch(
  "/update-user/:id",
  verifyJWT,
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "additionalFile", maxCount: 1 },
  ]),
  updateUserController
);

module.exports = router;
