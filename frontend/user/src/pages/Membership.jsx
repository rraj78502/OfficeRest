import React, { useState, useRef } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const api_base_url = import.meta.env.VITE_API_URL;

function Membership() {
  const [formData, setFormData] = useState({
    employeeId: "",
    username: "",
    surname: "",
    address: "",
    mobileNumber: "",
    telephoneNumber: "",
    province: "",
    district: "",
    municipality: "",
    wardNumber: "",
    tole: "",
    dob: null,
    postAtRetirement: "",
    pensionLeaseNumber: "",
    office: "",
    serviceStartDate: null,
    serviceRetirementDate: null,
    dateOfFillUp: null,
    place: "",
    email: "",
    password: "",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [additionalFile, setAdditionalFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [membershipNumber, setMembershipNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const fileInputRef = useRef(null);

  // Real-time validation state
  const [fieldValidation, setFieldValidation] = useState({
    employeeId: { isChecking: false, isAvailable: null, message: "" },
    email: { isChecking: false, isAvailable: null, message: "" },
    mobileNumber: { isChecking: false, isAvailable: null, message: "" },
  });
  const [validationTimeouts, setValidationTimeouts] = useState({});

  // Function to check field availability
  const checkFieldAvailability = async (field, value) => {
    if (!value || value.length < 3) return;

    try {
      const response = await axios.get(
        `${api_base_url}/api/v1/user/check-availability?field=${field}&value=${value}`,
        { withCredentials: true }
      );

      setFieldValidation(prev => ({
        ...prev,
        [field]: {
          isChecking: false,
          isAvailable: response.data.data.isAvailable,
          message: response.data.data.message
        }
      }));
    } catch (error) {
      setFieldValidation(prev => ({
        ...prev,
        [field]: {
          isChecking: false,
          isAvailable: false,
          message: "Error checking availability"
        }
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation for unique fields
    const fieldsToValidate = ["employeeId", "email", "mobileNumber"];
    if (fieldsToValidate.includes(name)) {
      // Clear previous timeout
      if (validationTimeouts[name]) {
        clearTimeout(validationTimeouts[name]);
      }

      // Reset validation state
      setFieldValidation(prev => ({
        ...prev,
        [name]: { isChecking: false, isAvailable: null, message: "" }
      }));

      // Set up new timeout for debounced validation
      if (value && value.length >= 3) {
        setFieldValidation(prev => ({
          ...prev,
          [name]: { ...prev[name], isChecking: true }
        }));

        const timeout = setTimeout(() => {
          checkFieldAvailability(name, value);
        }, 800); // 800ms delay

        setValidationTimeouts(prev => ({
          ...prev,
          [name]: timeout
        }));
      }
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name === "profilePic") {
        setProfilePic(files[0]);
        setProfilePicPreview(URL.createObjectURL(files[0]));
      } else if (name === "additionalFile") {
        setAdditionalFile(files[0]);
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleDateChange = (date, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date ? format(date, "yyyy-MM-dd") : null,
    }));
  };

  // Helper function to render validation feedback
  const renderValidationFeedback = (fieldName) => {
    const validation = fieldValidation[fieldName];
    if (!validation) return null;

    if (validation.isChecking) {
      return (
        <div className="text-blue-500 text-sm mt-1 flex items-center">
          <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Checking availability...
        </div>
      );
    }

    if (validation.isAvailable === true) {
      return (
        <div className="text-green-600 text-sm mt-1 flex items-center">
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          {validation.message}
        </div>
      );
    }

    if (validation.isAvailable === false) {
      return (
        <div className="text-red-600 text-sm mt-1 flex items-center">
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          {validation.message}
        </div>
      );
    }

    return null;
  };

  const validateForm = () => {
    const requiredFields = [
      "employeeId",
      "username",
      "surname",
      "address",
      "mobileNumber",
      "telephoneNumber",
      "province",
      "district",
      "municipality",
      "wardNumber",
      "tole",
      "dob",
      "postAtRetirement",
      "pensionLeaseNumber",
      "office",
      "serviceStartDate",
      "serviceRetirementDate",
      "dateOfFillUp",
      "place",
      "email",
      "password",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        return `Field '${field}' is required`;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Invalid email format";
    }

    // Phone number validation
    const phoneRegex = /^\d{7,15}$/;
    if (
      !phoneRegex.test(formData.mobileNumber) ||
      !phoneRegex.test(formData.telephoneNumber)
    ) {
      return "Phone numbers must be 7-15 digits";
    }

    // // Password validation
    // const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    // if (!passwordRegex.test(formData.password)) {
    //   return "Password must be at least 8 characters long and contain letters and numbers";
    // }

    // File validation
    if (!profilePic) {
      return "Profile picture is required";
    }
    if (profilePic && !profilePic.type.startsWith("image/")) {
      return "Profile picture must be an image";
    }
    if (
      additionalFile &&
      ![
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
      ].includes(additionalFile.type)
    ) {
      return "Identification must be an image or PDF";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      setError(validationError); // Optionally keep for debugging
      return;
    }

    // Check if any unique fields are not available
    const unavailableFields = [];
    if (fieldValidation.employeeId.isAvailable === false) unavailableFields.push("Employee ID");
    if (fieldValidation.email.isAvailable === false) unavailableFields.push("Email");
    if (fieldValidation.mobileNumber.isAvailable === false) unavailableFields.push("Mobile Number");

    if (unavailableFields.length > 0) {
      const message = `${unavailableFields.join(", ")} ${unavailableFields.length === 1 ? 'is' : 'are'} already taken. Please use different ${unavailableFields.join(", ").toLowerCase()}.`;
      toast.error(message);
      setError(message);
      return;
    }

    try {
      const formDataToSend = new FormData();
      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value);
        }
      });
      // Append files
      if (profilePic) {
        formDataToSend.append("profilePic", profilePic);
      }
      if (additionalFile) {
        formDataToSend.append("additionalFile", additionalFile);
      }

      const response = await axios.post(
        `${api_base_url}/api/v1/user/register`,
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess(response.data.message);
      setMembershipNumber(response.data.data.membershipNumber || "N/A");
      setRegistrationNumber(response.data.data.registrationNumber || "N/A");
      setShowSuccessPopup(true);
      setFormData({
        employeeId: "",
        username: "",
        surname: "",
        address: "",
        mobileNumber: "",
        telephoneNumber: "",
        province: "",
        district: "",
        municipality: "",
        wardNumber: "",
        tole: "",
        dob: null,
        postAtRetirement: "",
        pensionLeaseNumber: "",
        office: "",
        serviceStartDate: null,
        serviceRetirementDate: null,
        dateOfFillUp: null,
        place: "",
        email: "",
        password: "",
      });
      setProfilePic(null);
      setProfilePicPreview(null);
      setAdditionalFile(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  const closePopup = () => {
    setShowSuccessPopup(false);
    setMembershipNumber("");
    setRegistrationNumber("");
  };

  const minDob = new Date(1900, 0, 1);
  const maxDob = new Date();
  const minServiceDate = new Date(1900, 0, 1);
  const maxServiceRetirementDate = new Date();
  const maxFillUpDate = new Date();

  return (
    <div className="bg-white text-gray-800 px-6 py-20 flex justify-center">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded p-10">
        <h1 className="text-4xl font-bold text-center mb-6">
        सदस्यताको लागि भर्ने फारम
        </h1>
        <div className="text-left mb-6">
          <p className="text-lg font-semibold">श्रीमान अध्यक्ष ज्यू ,</p>
          {/* <p className="font-semibold text-xl">The President,</p> */}
          <p className="text-lg">नेपाल दूरसञ्चार निवृत कर्मचारी समाज ।</p>
        </div>
        <p className="mb-6 text-md text-left">
        महोदय,
          <br />नेपाल दूरसञ्चार निवृत्त कर्मचारी समाजको विधान अध्ययन गरी आजीवन / साधारण सदस्यताको लामि व्यक्तिगत विवरण सहित निवेदन गरेको छु। यस समाजको विधान, नियम र निर्णयहरु पालना गर्नेछु ।
        </p>

        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        {success && !showSuccessPopup && (
          <div className="text-green-500 mb-4 text-center">{success}</div>
        )}

        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
              <div className="flex justify-center mb-4">
                <svg
                  className="w-16 h-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                Registration Successful!
              </h2>
              <p className="text-center text-gray-600 mb-2">
                Your membership application has been successfully submitted.
              </p>
              <p className="text-center text-gray-600 mb-2">
                <strong>Membership Number:</strong> {membershipNumber}
              </p>
              <p className="text-center text-gray-600 mb-6">
                <strong>Registration Number:</strong> {registrationNumber}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={closePopup}
                  className="bg-[#0c1c35] text-white px-6 py-2 rounded-lg hover:bg-[#13284c] transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#0c1c35] text-white px-4 py-2 font-semibold rounded mb-6">
            Personal Information (व्यक्तिगत विवरण)
          </div>
          <div className="flex justify-center mb-6">
            <div
              className="relative w-30 h-30 rounded-full overflow-hidden border-2 border-gray-300 cursor-pointer group"
              onClick={handleAvatarClick}
            >
              {profilePicPreview ? (
                <img
                  src={profilePicPreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100">
                  <svg
                    className="w-12 h-12 text-gray-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  ></path>
                </svg>
              </div>
              <input
                type="file"
                name="profilePic"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label>
                First Name(पहिलो नाम) <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 p-2 border rounded w-full"
                required
              />
            </div>
            <div>
              <label>
                Surname(थर) <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                className="mt-1 p-2 border rounded w-full"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label>
                Email(इमेल) <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 p-2 border rounded w-full ${
                  fieldValidation.email.isAvailable === false ? 'border-red-500' : 
                  fieldValidation.email.isAvailable === true ? 'border-green-500' : ''
                }`}
                required
              />
              {renderValidationFeedback('email')}
            </div>
            <div>
              <label>
                Password(पासवर्ड) <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 p-2 border rounded w-full"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label>
                Mobile Number(मोबाइल नंबर) <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className={`mt-1 p-2 border rounded w-full ${
                  fieldValidation.mobileNumber.isAvailable === false ? 'border-red-500' : 
                  fieldValidation.mobileNumber.isAvailable === true ? 'border-green-500' : ''
                }`}
                required
              />
              {renderValidationFeedback('mobileNumber')}
            </div>
            <div>
              <label>
                Telephone Number(टेलिफोन नम्बर) <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="tel"
                name="telephoneNumber"
                value={formData.telephoneNumber}
                onChange={handleChange}
                className="mt-1 p-2 border rounded w-full"
                required
              />
            </div>
          </div>

          <div>
            <label>
              Date of Birth(जन्म मिति) <span style={{ color: 'red' }}>*</span>
            </label>
            <DatePicker
              selected={formData.dob ? new Date(formData.dob) : null}
              onChange={(date) => handleDateChange(date, "dob")}
              dateFormat="yyyy-MM-dd"
              className="mt-1 p-2 border rounded w-full"
              placeholderText="Select Date"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              minDate={minDob}
              maxDate={maxDob}
              yearDropdownItemNumber={100}
              scrollableYearDropdown
              required
            />
          </div>

          <div>
            <label>
              Identification (Image/PDF) परिचयपत्र (छवि वा PDF अपलोड गर्नुहोस्) <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="file"
              name="additionalFile"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="mt-1 p-2 border rounded w-full"
              required
            />
          </div>

          <div className="bg-[#0c1c35] text-white px-4 py-2 font-semibold rounded mt-10 mb-6">
            Address Information(ठेगाना विवरण)
          </div>
          <div>
            <label>
              Address(ठेगाना) <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 p-2 border rounded w-full"
              required
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label>
                Province <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="mt-1 p-2 border rounded w-full"
                required
              >
                <option value="">Select Province</option>
                <option value="province 1">Province 1</option>
                <option value="province 2">Province 2</option>
                <option value="bagmati">Bagmati</option>
                <option value="gandaki">Gandaki</option>
                <option value="lumbini">Lumbini</option>
                <option value="karnali">Karnali</option>
                <option value="sudurpashchim">Sudurpashchim</option>
              </select>
            </div>
            <div>
              <label>
                District(जिला) <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="mt-1 p-2 border rounded w-full"
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label>
                Municipality/Metropolitan(नगरपालिका/महानगरपालिका) <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                name="municipality"
                value={formData.municipality}
                onChange={handleChange}
                className="mt-1 p-2 border rounded w-full"
                required
              />
            </div>
            <div>
              <label>
                Ward Number(वार्ड नंबर) <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                name="wardNumber"
                value={formData.wardNumber}
                onChange={handleChange}
                className="mt-1 p-2 border rounded w-full"
                required
              />
            </div>
          </div>
          <div>
            <label>
              Tole(टोल) <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              name="tole"
              value={formData.tole}
              onChange={handleChange}
              className="mt-1 p-2 border rounded w-full"
              required
            />
          </div>

          <div className="bg-[#0c1c35] text-white px-4 py-2 font-semibold rounded mt-10 mb-6">
            Organization Information(संगठन विवरण)
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label>
                Employee ID(कर्मचारी नंबर) <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className={`mt-1 p-2 border rounded w-full ${
                  fieldValidation.employeeId.isAvailable === false ? 'border-red-500' : 
                  fieldValidation.employeeId.isAvailable === true ? 'border-green-500' : ''
                }`}
                required
              />
              {renderValidationFeedback('employeeId')}
            </div>
            <div>
              <label>
                Office(कार्यालय) <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                name="office"
                value={formData.office}
                onChange={handleChange}
                className="mt-1 p-2 border rounded w-full"
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label>
                Post at Retirement(अवकाशको पद) <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                name="postAtRetirement"
                value={formData.postAtRetirement}
                onChange={handleChange}
                className="mt-1 p-2 border rounded w-full"
                required
              />
            </div>
            <div>
              <label>
                Pension Lease Number(पेन्सन लिज नम्बर) <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                name="pensionLeaseNumber"
                value={formData.pensionLeaseNumber}
                onChange={handleChange}
                className="mt-1 p-2 border rounded w-full"
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label>
                Service Start Date(सेवा सुरु मिति) <span style={{ color: 'red' }}>*</span>
              </label>
              <DatePicker
                selected={
                  formData.serviceStartDate
                    ? new Date(formData.serviceStartDate)
                    : null
                }
                onChange={(date) => handleDateChange(date, "serviceStartDate")}
                dateFormat="yyyy-MM-dd"
                className="mt-1 p-2 border rounded w-full"
                placeholderText="Select Date"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                minDate={minServiceDate}
                maxDate={maxServiceRetirementDate}
                yearDropdownItemNumber={100}
                scrollableYearDropdown
                required
              />
            </div>
            <div>
              <label>
                Service Retirement Date(सेवा निवृत्ति मिति) <span style={{ color: 'red' }}>*</span>
              </label>
              <DatePicker
                selected={
                  formData.serviceRetirementDate
                    ? new Date(formData.serviceRetirementDate)
                    : null
                }
                onChange={(date) =>
                  handleDateChange(date, "serviceRetirementDate")
                }
                dateFormat="yyyy-MM-dd"
                className="mt-1 p-2 border rounded w-full"
                placeholderText="Select Date"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                minDate={
                  formData.serviceStartDate
                    ? new Date(formData.serviceStartDate)
                    : minServiceDate
                }
                maxDate={maxServiceRetirementDate}
                yearDropdownItemNumber={100}
                scrollableYearDropdown
                required
              />
            </div>
          </div>

          <div className="bg-[#0c1c35] text-white px-4 py-2 font-semibold rounded mt-10 mb-6">
            Membership Information(संगठन विवरण)
          </div>
          <div>
            <label>
              Date of Fill Up(भर्नु मिति) <span style={{ color: 'red' }}>*</span>
            </label>
            <DatePicker
              selected={
                formData.dateOfFillUp ? new Date(formData.dateOfFillUp) : null
              }
              onChange={(date) => handleDateChange(date, "dateOfFillUp")}
              dateFormat="yyyy-MM-dd"
              className="mt-1 p-2 border rounded w-full"
              placeholderText="Select Date"
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              maxDate={maxFillUpDate}
              yearDropdownItemNumber={100}
              scrollableYearDropdown
              required
            />
          </div>
          <div>
            <label>
              Place(स्थान) <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              name="place"
              value={formData.place}
              onChange={handleChange}
              className="mt-1 p-2 border rounded w-full"
              required
            />
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="reset"
              className="bg-white border border-gray-400 px-4 py-2 rounded hover:bg-gray-100"
              onClick={() => {
                setFormData({
                  employeeId: "",
                  username: "",
                  surname: "",
                  address: "",
                  mobileNumber: "",
                  telephoneNumber: "",
                  province: "",
                  district: "",
                  municipality: "",
                  wardNumber: "",
                  tole: "",
                  dob: null,
                  postAtRetirement: "",
                  pensionLeaseNumber: "",
                  office: "",
                  serviceStartDate: null,
                  serviceRetirementDate: null,
                  dateOfFillUp: null,
                  place: "",
                  email: "",
                  password: "",
                });
                setProfilePic(null);
                setProfilePicPreview(null);
                setAdditionalFile(null);
              }}
            >
              Reset
            </button>
            <button
              type="submit"
              className="bg-[#0c1c35] text-white px-6 py-2 rounded hover:bg-[#13284c]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

export default Membership;
