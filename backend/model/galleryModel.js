const mongoose = require('mongoose');

const categories = [
  "All Photos",
  "Meetings",
  "Social Events",
  "Cultural Programs",
  "Workshops",
  "Ceremonies",
];

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: {
      values: categories,
      message: 'Invalid category. Must be one of: {VALUE}',
    },
    default: 'All Photos',
  },
  date: {
    type: String,
    required: true,
    trim: true,
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
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Gallery', gallerySchema);