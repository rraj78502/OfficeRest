const asyncHandler = require("../utils/asyncHandler");
const Carousel = require("../model/carouselModel");
const Branch = require("../model/branchModel");
const { uploadFileWithFolderLogic, deleteFileFromCloudinary } = require("../helper/cloudinaryHepler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");

// Upload carousel images (Admin only)
const uploadCarouselController = asyncHandler(async (req, res) => {
  const { title, type, branch } = req.body;

  // Validate inputs
  if (!title || !type) {
    throw new ApiError(400, "Title and type are required");
  }

  let normalizedBranch;
  if (type === "branch") {
    if (!branch) {
      throw new ApiError(400, "Branch is required for branch type carousel");
    }

    const rawBranch = branch.toString().trim().toLowerCase();
    if (!rawBranch) {
      throw new ApiError(400, "Branch identifier cannot be empty");
    }

    let branchRecord = await Branch.findBySlug(rawBranch);

    if (!branchRecord && mongoose.Types.ObjectId.isValid(rawBranch)) {
      branchRecord = await Branch.findById(rawBranch);
    }

    if (!branchRecord) {
      throw new ApiError(404, "Branch not found for carousel");
    }

    normalizedBranch = branchRecord.slug;
  }

  // Validate file uploads
  if (!req.files || req.files.length < 1 || req.files.length > 10) {
    throw new ApiError(400, "At least one image is required (max 10)");
  }

  // Validate file types (only images)
  const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  req.files.forEach((file) => {
    if (!allowedImageTypes.includes(file.mimetype)) {
      throw new ApiError(400, "Only JPEG, PNG, GIF, or WebP images are allowed");
    }
  });

  // Upload files to Cloudinary
  const images = [];
  for (const file of req.files) {
    try {
      const result = await uploadFileWithFolderLogic(file.path, file.mimetype, "Carousel");
      console.log(`Cloudinary upload result for ${file.path}:`, result);
      if (result && result.secure_url) {
        images.push({
          url: result.secure_url,
          type: file.mimetype,
          publicId: result.public_id,
          alt: `${title} - Carousel Image`,
        });
      } else {
        console.error(`No secure_url for file ${file.path}`);
      }
    } catch (error) {
      console.error(`Failed to upload file ${file.path}:`, error.message);
    }
  }

  if (images.length === 0) {
    throw new ApiError(400, "Failed to upload any images to Cloudinary");
  }

  // Get the next order number
  const query = { type };
  if (normalizedBranch) {
    query.branch = normalizedBranch;
  }
  const lastCarousel = await Carousel.findOne(query).sort({ order: -1 });
  const order = lastCarousel ? lastCarousel.order + 1 : 1;

  // Save carousel to MongoDB
  const carousel = await Carousel.create({
    title,
    type,
    branch: normalizedBranch,
    images,
    order,
  });

  console.log("✅ Carousel saved to MongoDB:", carousel);

  return res
    .status(201)
    .json(new ApiResponse(201, carousel, "Carousel images uploaded successfully"));
});

// Get all carousels (Public)
const getAllCarouselsController = asyncHandler(async (req, res) => {
  const { type, branch } = req.query;
  
  let filter = { isActive: true };
  if (type) filter.type = type;
  if (branch) {
    filter.branch = branch.toString().trim().toLowerCase();
  }

  const carousels = await Carousel.find(filter).sort({ order: 1, createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, carousels, "Carousels fetched successfully"));
});

// Get carousel by ID (Public)
const getCarouselByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid carousel ID");
  }

  const carousel = await Carousel.findById(id);

  if (!carousel) {
    throw new ApiError(404, "Carousel not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, carousel, "Carousel fetched successfully"));
});

// Update carousel (Admin only)
const updateCarouselController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, isActive, order } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid carousel ID");
  }

  const carousel = await Carousel.findById(id);
  if (!carousel) {
    throw new ApiError(404, "Carousel not found");
  }

  // Update fields
  if (title) carousel.title = title;
  if (typeof isActive === 'boolean') carousel.isActive = isActive;
  if (order !== undefined) carousel.order = parseInt(order);

  await carousel.save();

  return res
    .status(200)
    .json(new ApiResponse(200, carousel, "Carousel updated successfully"));
});

// Delete image from carousel (Admin only)
const deleteCarouselImageController = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid carousel ID");
  }

  const carousel = await Carousel.findById(id);
  if (!carousel) {
    throw new ApiError(404, "Carousel not found");
  }

  const image = carousel.images.find((img) => img._id.toString() === imageId);
  if (!image) {
    throw new ApiError(404, "Image not found in carousel");
  }

  // Delete from Cloudinary
  try {
    const result = await deleteFileFromCloudinary(image.url, image.type);
    if (result && result.result === 'not found') {
      console.warn(`Image not found in Cloudinary, proceeding with database deletion: ${image.url}`);
    } else {
      console.log(`Cloudinary deletion successful for ${image.url}`);
    }
  } catch (error) {
    console.error(`Failed to delete image from Cloudinary: ${error.message}`);
    throw new ApiError(500, `Failed to delete image from Cloudinary: ${error.message}`);
  }

  // Remove image from carousel
  carousel.images = carousel.images.filter((img) => img._id.toString() !== imageId);

  if (carousel.images.length === 0) {
    // If no images remain, delete the entire carousel
    await Carousel.findByIdAndDelete(id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Carousel deleted (no images remaining)"));
  } else {
    // Update the carousel with remaining images
    await carousel.save();
    return res
      .status(200)
      .json(new ApiResponse(200, carousel, "Image deleted successfully"));
  }
});

// Delete entire carousel (Admin only)
const deleteCarouselController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid carousel ID");
  }

  const carousel = await Carousel.findById(id);
  if (!carousel) {
    throw new ApiError(404, "Carousel not found");
  }

  // Delete all images from Cloudinary
  for (const image of carousel.images) {
    try {
      const result = await deleteFileFromCloudinary(image.url, image.type);
      if (result && result.result === 'not found') {
        console.warn(`Image not found in Cloudinary: ${image.url}`);
      } else {
        console.log(`Cloudinary deletion successful for ${image.url}`);
      }
    } catch (error) {
      console.error(`Failed to delete image from Cloudinary: ${error.message}`);
    }
  }

  // Delete carousel from MongoDB
  await Carousel.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Carousel deleted successfully"));
});

// Add images to existing carousel (Admin only)
const addImagesToCarouselController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid carousel ID");
  }

  const carousel = await Carousel.findById(id);
  if (!carousel) {
    throw new ApiError(404, "Carousel not found");
  }

  // Validate file uploads
  if (!req.files || req.files.length < 1) {
    throw new ApiError(400, "At least one image is required");
  }

  if (carousel.images.length + req.files.length > 10) {
    throw new ApiError(400, `Cannot exceed 10 images per carousel. Current: ${carousel.images.length}, Adding: ${req.files.length}`);
  }

  // Validate file types (only images)
  const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  req.files.forEach((file) => {
    if (!allowedImageTypes.includes(file.mimetype)) {
      throw new ApiError(400, "Only JPEG, PNG, GIF, or WebP images are allowed");
    }
  });

  // Upload files to Cloudinary
  const newImages = [];
  for (const file of req.files) {
    try {
      const result = await uploadFileWithFolderLogic(file.path, file.mimetype, "Carousel");
      if (result && result.secure_url) {
        newImages.push({
          url: result.secure_url,
          type: file.mimetype,
          publicId: result.public_id,
          alt: `${carousel.title} - Carousel Image`,
        });
      }
    } catch (error) {
      console.error(`Failed to upload file ${file.path}:`, error.message);
    }
  }

  if (newImages.length === 0) {
    throw new ApiError(400, "Failed to upload any images to Cloudinary");
  }

  // Add new images to carousel
  carousel.images.push(...newImages);
  await carousel.save();

  return res
    .status(200)
    .json(new ApiResponse(200, carousel, `${newImages.length} image(s) added successfully`));
});

module.exports = {
  uploadCarouselController,
  getAllCarouselsController,
  getCarouselByIdController,
  updateCarouselController,
  deleteCarouselImageController,
  deleteCarouselController,
  addImagesToCarouselController,
};
