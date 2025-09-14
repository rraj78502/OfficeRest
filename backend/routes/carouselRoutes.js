const express = require("express");
const upload = require("../middleware/multer");
const verifyJWT = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/verifyAdmin");
const {
  uploadCarouselController,
  getAllCarouselsController,
  getCarouselByIdController,
  updateCarouselController,
  deleteCarouselImageController,
  deleteCarouselController,
  addImagesToCarouselController,
} = require("../controller/carouselController");

const router = express.Router();

// Public routes
router.get("/get-all-carousels", getAllCarouselsController);
router.get("/get-carousel/:id", getCarouselByIdController);

// Admin-only routes
router.post("/upload-carousel", verifyJWT, verifyAdmin, upload.array("images", 10), uploadCarouselController);
router.put("/update-carousel/:id", verifyJWT, verifyAdmin, updateCarouselController);
router.post("/add-images/:id", verifyJWT, verifyAdmin, upload.array("images", 10), addImagesToCarouselController);
router.delete("/delete-carousel/:id", verifyJWT, verifyAdmin, deleteCarouselController);
router.delete("/delete-carousel-image/:id/:imageId", verifyJWT, verifyAdmin, deleteCarouselImageController);

module.exports = router;