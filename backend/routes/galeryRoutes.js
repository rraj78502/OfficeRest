const express = require("express");
const upload = require("../middleware/multer");
const verifyJWT = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/verifyAdmin");
const {
  uploadImagesController,
  deleteImageController,
  getAllImagesController,
  getImageByIdController,
  deletePostController,
} = require("../controller/galleryController");

const router = express.Router();

// Public routes
router.get("/get-all-images", getAllImagesController);
router.get("/get-image/:id", getImageByIdController);

// Admin-only routes
router.post("/upload-images", verifyJWT, verifyAdmin, upload.array("images", 10), uploadImagesController);
router.delete("/delete-image/:id/:imageId", verifyJWT, verifyAdmin, deleteImageController);
router.delete('/delete-post/:id', verifyJWT, verifyAdmin, deletePostController);

module.exports = router;