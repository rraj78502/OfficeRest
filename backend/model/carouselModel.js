const mongoose = require("mongoose");

const carouselSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["home", "branch"],
      default: "home",
    },
    branch: {
      type: String,
      required: function() {
        return this.type === "branch";
      },
      trim: true,
      lowercase: true,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          default: "",
        }
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
carouselSchema.index({ type: 1, isActive: 1, order: 1 });
carouselSchema.index({ type: 1, branch: 1, isActive: 1 });

module.exports = mongoose.model("Carousel", carouselSchema);
