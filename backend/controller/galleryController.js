const asyncHandler = require("../utils/asyncHandler");
const Gallery = require("../model/galleryModel");
const { uploadFileWithFolderLogic, deleteFileFromCloudinary } = require("../helper/cloudinaryHepler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");

// Upload images (Admin only)
const uploadImagesController = asyncHandler(async (req, res) => {
  const { title, category, date } = req.body;

  // Validate inputs
  if (!title || !category || !date) {
    throw new ApiError(400, "Title, category, and date are required");
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
      const result = await uploadFileWithFolderLogic(file.path, file.mimetype, "Gallery");
      console.log(`Cloudinary upload result for ${file.path}:`, result);
      if (result && result.secure_url) {
        images.push({
          url: result.secure_url,
          type: file.mimetype,
          publicId: result.public_id,
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

  // Save images as a single post to MongoDB
  const post = await Gallery.create({
    title,
    category,
    date,
    images,
  });
  console.log("✅ Post saved to MongoDB:", post);

  return res
    .status(201)
    .json(new ApiResponse(201, post, "Images uploaded successfully as a post"));
});

// Delete image from a post (Admin only)
const deleteImageController = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid post ID");
  }

  const post = await Gallery.findById(id);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const image = post.images.find((img) => img._id.toString() === imageId);
  if (!image) {
    throw new ApiError(404, "Image not found in post");
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

  // Remove image from post
  post.images = post.images.filter((img) => img._id.toString() !== imageId);

  if (post.images.length === 0) {
    // If no images remain, delete the entire post
    await Gallery.findByIdAndDelete(id);
  } else {
    // Update the post with remaining images
    await post.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Image deleted successfully"));
});

// Delete entire post (Admin only)
const deletePostController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid post ID");
  }

  const post = await Gallery.findById(id);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // Delete all images from Cloudinary
  for (const image of post.images) {
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

  // Delete post from MongoDB
  await Gallery.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Post deleted successfully"));
});

// Get all posts (Public)
const getAllImagesController = asyncHandler(async (req, res) => {
  const posts = await Gallery.find({}).sort({ createdAt: -1 });

  if (!posts.length) {
    throw new ApiError(404, "No posts found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, posts, "All posts fetched successfully"));
});

// Get post by ID (Public)
const getImageByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid post ID");
  }

  const post = await Gallery.findById(id);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post fetched successfully"));
});

module.exports = {
  uploadImagesController,
  deleteImageController,
  deletePostController,
  getAllImagesController, 
  getImageByIdController,
};