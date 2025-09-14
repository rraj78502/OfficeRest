const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./model/userModel");

// Load .env
dotenv.config({ path: ".env" });
console.log("Loaded environment from: .env");
console.log("MONGO_URI:", process.env.MONGO_URI);

// Admin data
const adminData = {
  employeeId: "7856",
  username: "admin10",
  surname: "admin10",
  address: "address",
  province: "provie",
  district: "distct",
  municipality: "munipality",
  wardNumber: "2",
  tole: "toe",
  telephoneNumber: "9876543210",
  mobileNumber: "9851347856",
  dob: "1990-01-10",
  postAtRetirement: "admin",
  pensionLeaseNumber: "PLN10",
  office: "head offce",
  serviceStartDate: "2010-01-10",
  serviceRetirementDate: "2040-01-10",
  membershipNumber: "MN10",
  registrationNumber: "RN10",
  dateOfFillUp: "2023-01-10",
  place: "plae",
  email: "restntcadmi@gmail.com",
  password: "admin123", // model should hash this
  role: "admin",
};

// Migration-style function
const registerAdmin = async () => {
  try {
    // Connect to MongoDB (REST_PROD)
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB (REST_PROD)");

    // Check if admin already exists
    const existingUser = await User.findOne({
      $or: [{ employeeId: adminData.employeeId }, { email: adminData.email }],
    });

    if (existingUser) {
      console.log("Admin already exists, skipping insert");
    } else {
      await User.create(adminData);
      console.log("Admin registered successfully in REST_PROD");
    }

    // Close connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Admin registration failed:", error);
    process.exit(1);
  }
};

// Run
registerAdmin();

