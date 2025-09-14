import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";

const api_base_url = import.meta.env.VITE_API_URL;

function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${api_base_url}/api/v1/user/check-auth`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        setError("User not authenticated");
        navigate("/login");
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error.message);
      setError("Failed to load profile. Please log in.");
      navigate("/login");
    }
  };

  if (error) {
    return <div className="text-red-500 text-center mt-20">{error}</div>;
  }

  if (!user) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <div className="bg-white text-gray-800 px-6 py-20 flex justify-center">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded p-10">
        <h1 className="text-4xl font-bold text-center mb-6">User Profile</h1>
        <p className="text-lg text-center mb-6">
          Below are your details as registered with the Nepal Telecommunications Employees Association.
        </p>

        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
            <img
              src={user.profilePic || "https://via.placeholder.com/96"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-[#0c1c35] text-white px-4 py-2 font-semibold rounded mb-6">
          Personal Information
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="font-semibold">Username</label>
            <p>{user.username}</p>
          </div>
          <div>
            <label className="font-semibold">Surname</label>
            <p>{user.surname}</p>
          </div>
          <div>
            <label className="font-semibold">Email</label>
            <p>{user.email}</p>
          </div>
          <div>
            <label className="font-semibold">Mobile Number</label>
            <p>{user.mobileNumber}</p>
          </div>
          <div>
            <label className="font-semibold">Telephone Number</label>
            <p>{user.telephoneNumber}</p>
          </div>
          <div>
            <label className="font-semibold">Date of Birth</label>
            <p>{user.dob ? format(new Date(user.dob), "MMMM d, yyyy") : "N/A"}</p>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-[#0c1c35] text-white px-4 py-2 font-semibold rounded mb-6">
          Address Information
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="font-semibold">Address</label>
            <p>{user.address}</p>
          </div>
          <div>
            <label className="font-semibold">Province</label>
            <p>{user.province}</p>
          </div>
          <div>
            <label className="font-semibold">District</label>
            <p>{user.district}</p>
          </div>
          <div>
            <label className="font-semibold">Municipality/Metropolitan</label>
            <p>{user.municipality}</p>
          </div>
          <div>
            <label className="font-semibold">Ward Number</label>
            <p>{user.wardNumber}</p>
          </div>
          <div>
            <label className="font-semibold">Tole</label>
            <p>{user.tole}</p>
          </div>
        </div>

        {/* Organization Information */}
        <div className="bg-[#0c1c35] text-white px-4 py-2 font-semibold rounded mb-6">
          Organization Information
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="font-semibold">Employee ID</label>
            <p>{user.employeeId}</p>
          </div>
          <div>
            <label className="font-semibold">Office</label>
            <p>{user.office}</p>
          </div>
          <div>
            <label className="font-semibold">Post at Retirement</label>
            <p>{user.postAtRetirement}</p>
          </div>
          <div>
            <label className="font-semibold">Pension Lease Number</label>
            <p>{user.pensionLeaseNumber}</p>
          </div>
          <div>
            <label className="font-semibold">Service Start Date</label>
            <p>{user.serviceStartDate ? format(new Date(user.serviceStartDate), "MMMM d, yyyy") : "N/A"}</p>
          </div>
          <div>
            <label className="font-semibold">Service Retirement Date</label>
            <p>{user.serviceRetirementDate ? format(new Date(user.serviceRetirementDate), "MMMM d, yyyy") : "N/A"}</p>
          </div>
        </div>

        {/* Membership Information */}
        <div className="bg-[#0c1c35] text-white px-4 py-2 font-semibold rounded mb-6">
          Membership Information
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="font-semibold">Membership Number</label>
            <p>{user.membershipNumber || "N/A"}</p>
          </div>
          <div>
            <label className="font-semibold">Registration Number</label>
            <p>{user.registrationNumber || "N/A"}</p>
          </div>
          <div>
            <label className="font-semibold">Date of Fill Up</label>
            <p>{user.dateOfFillUp ? format(new Date(user.dateOfFillUp), "MMMM d, yyyy") : "N/A"}</p>
          </div>
          <div>
            <label className="font-semibold">Place</label>
            <p>{user.place}</p>
          </div>
        </div>

        {/* Additional File (if exists) */}
        {user.files && (
          <div className="mb-6">
            <div className="bg-[#0c1c35] text-white px-4 py-2 font-semibold rounded mb-4">
              Additional Document
            </div>
            <a
              href={user.files}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View Additional Document
            </a>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="bg-[#0c1c35] text-white px-6 py-2 rounded hover:bg-[#13284c]"
          >
            Back to Home
          </button>
          <button
            onClick={async () => {
              await axios.post(`${api_base_url}/api/v1/user/logout`, {}, { withCredentials: true });
              navigate("/login");
            }}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
