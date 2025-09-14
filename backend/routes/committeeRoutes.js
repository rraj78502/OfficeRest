const express = require("express");
const {
  createCommitteeMember,
  getAllCommitteeMembers,
  getCommitteeMemberById,
  updateCommitteeMember,
  deleteCommitteeMember,
  getCommitteeTitles,
} = require("../controller/committeeController");
const upload = require("../middleware/multer");
const verifyJWT = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();  


// Routes for committee members
router
  .route("/")
  .get(getAllCommitteeMembers) // Public access to view committee members
  .post(verifyJWT, verifyAdmin, upload.fields([{ name: "profilePic", maxCount: 1 }]), createCommitteeMember);
router.get("/titles", getCommitteeTitles);
router
  .route("/:id")
  .get(getCommitteeMemberById)
  .put(verifyJWT, verifyAdmin, upload.fields([{ name: "profilePic", maxCount: 1 }]), updateCommitteeMember)
  .delete(verifyJWT, verifyAdmin, deleteCommitteeMember);

   

module.exports = router;
