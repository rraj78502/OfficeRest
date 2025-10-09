const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Branch name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Branch slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Branch address is required"],
      trim: true,
    },
    mapLink: {
      type: String,
      required: [true, "Map link is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Branch description is required"],
      trim: true,
    },
    contact: {
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
      },
    },
    workingHours: {
      type: String,
      required: [true, "Working hours are required"],
      default: "Sunday - Friday: 10:00 AM - 5:00 PM",
      trim: true,
    },
    services: [
      {
        name: {
          type: String,
          required: [true, "Service name is required"],
          trim: true,
        },
        description: {
          type: String,
          required: [true, "Service description is required"],
          trim: true,
        },
      },
    ],
    uniquePrograms: [
      {
        title: {
          type: String,
          required: [true, "Program title is required"],
          trim: true,
        },
        description: {
          type: String,
          required: [true, "Program description is required"],
          trim: true,
        },
        schedule: {
          type: String,
          trim: true,
        },
      },
    ],
    teamMembers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: [true, "Team member must reference a registered user"],
        },
        name: {
          type: String,
          trim: true,
        },
        position: {
          type: String,
          trim: true,
        },
        experience: {
          type: String,
          trim: true,
        },
        profilePic: {
          type: String, // URL for profile picture
          default: "",
        },
      },
    ],
    heroImage: {
      type: String, // URL for hero background image
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0, // For ordering branches in display
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { 
    timestamps: true,
    // Ensure virtual fields are serialized
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create index for better performance
// Note: `unique: true` on `slug` already creates a unique index,
// so we avoid declaring a duplicate index on `{ slug: 1 }`.
branchSchema.index({ isActive: 1, order: 1 });

// Pre-save middleware to generate slug from name
branchSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");
  }
  next();
});

// Virtual for full contact info
branchSchema.virtual("fullContact").get(function () {
  return {
    address: this.address,
    phone: this.contact.phone,
    email: this.contact.email,
    workingHours: this.workingHours,
  };
});

// Instance method to get public data (without sensitive info)
branchSchema.methods.getPublicData = function () {
  const branchObj = this.toObject();
  // Remove sensitive fields if any
  delete branchObj.createdBy;
  delete branchObj.updatedBy;
  return branchObj;
};

// Static method to get active branches
branchSchema.statics.getActiveBranches = function () {
  return this.find({ isActive: true }).sort({ order: 1, name: 1 });
};

// Static method to find by slug
branchSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug: slug.toLowerCase(), isActive: true });
};

const Branch = mongoose.model("Branch", branchSchema);

module.exports = Branch;
