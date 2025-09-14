const express = require("express");
const {
  getAllBranches,
  getBranchBySlug,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  toggleBranchStatus,
} = require("../controller/branchController");
const verifyJWT = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/verifyAdmin");
const upload = require("../middleware/multer");

const router = express.Router();

// Public routes
router.get("/", getAllBranches); // Get all active branches
router.get("/slug/:slug", getBranchBySlug); // Get branch by slug (for public branch pages)

// Admin-only routes
router.use(verifyJWT); // All routes below require authentication
router.use(verifyAdmin); // All routes below require admin role

// Branch CRUD operations for admin
router.post(
  "/",
  upload.fields([
    { name: "heroImage", maxCount: 1 },
    // Dynamic fields for team member profile pics (teamMember_0_profilePic, etc.)
    { name: "teamMember_0_profilePic", maxCount: 1 },
    { name: "teamMember_1_profilePic", maxCount: 1 },
    { name: "teamMember_2_profilePic", maxCount: 1 },
    { name: "teamMember_3_profilePic", maxCount: 1 },
    { name: "teamMember_4_profilePic", maxCount: 1 },
    { name: "teamMember_5_profilePic", maxCount: 1 },
    { name: "teamMember_6_profilePic", maxCount: 1 },
    { name: "teamMember_7_profilePic", maxCount: 1 },
    { name: "teamMember_8_profilePic", maxCount: 1 },
    { name: "teamMember_9_profilePic", maxCount: 1 },
  ]),
  createBranch
);

router.get("/:id", getBranchById); // Get branch by ID (with full data for admin)

router.put(
  "/:id",
  upload.fields([
    { name: "heroImage", maxCount: 1 },
    // Dynamic fields for team member profile pics
    { name: "teamMember_0_profilePic", maxCount: 1 },
    { name: "teamMember_1_profilePic", maxCount: 1 },
    { name: "teamMember_2_profilePic", maxCount: 1 },
    { name: "teamMember_3_profilePic", maxCount: 1 },
    { name: "teamMember_4_profilePic", maxCount: 1 },
    { name: "teamMember_5_profilePic", maxCount: 1 },
    { name: "teamMember_6_profilePic", maxCount: 1 },
    { name: "teamMember_7_profilePic", maxCount: 1 },
    { name: "teamMember_8_profilePic", maxCount: 1 },
    { name: "teamMember_9_profilePic", maxCount: 1 },
  ]),
  updateBranch
);

router.delete("/:id", deleteBranch);
router.patch("/:id/toggle-status", toggleBranchStatus); // Toggle active/inactive status

module.exports = router;