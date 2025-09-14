import { useState, useEffect } from "react";
import axios from "axios";
import { FaUsers } from "react-icons/fa";
import { toast } from "react-toastify";

function AllCommittees() {
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [committees, setCommittees] = useState([]);
  const [yearOptions, setYearOptions] = useState(["All Years"]);
  const [allMembers, setAllMembers] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Helper function to generate initials from a name
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Fetch committee members once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/committee-members`);
        const members = response.data.data || [];

        // Save all members for local filtering
        setAllMembers(members);

        // Extract unique committee titles
        const titles = [...new Set(members.map((m) => m.committeeTitle))];
        setYearOptions(["All Years", ...titles]);
      } catch (error) {
        toast.error("Failed to load committee members. Please try again later.");
        console.error("Error fetching committee members:", error);
      }
    };
    fetchData();
  }, []);

  // Filter/group members whenever selectedYear changes
  useEffect(() => {
    if (!allMembers.length) return;

    // Filter by selected year
    const filtered =
      selectedYear === "All Years"
        ? allMembers
        : allMembers.filter((m) => m.committeeTitle === selectedYear);

    // Group by committeeTitle
    const groupedCommittees = filtered.reduce((acc, member) => {
      const title = member.committeeTitle;
      if (!acc[title]) {
        acc[title] = { title, members: [], advisors: [] };
      }
      if (member.role === "Advisor") {
        acc[title].advisors.push(member);
      } else {
        acc[title].members.push(member);
      }
      return acc;
    }, {});

    setCommittees(Object.values(groupedCommittees));
  }, [selectedYear, allMembers]);

  return (
    <div className="px-6 py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12">All Working Committees</h1>
        <div className="mb-12 flex justify-center">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 text-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        {committees.map((committee) => (
          <section key={committee.title} className="mb-16">
            <h2 className="text-2xl font-semibold text-center mb-8">{committee.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {committee.members.map(({ _id, name, role, bio, profilePic }) => (
                <div
                  key={_id}
                  className="bg-white rounded-lg shadow overflow-hidden flex flex-col"
                >
                  <div className="h-48 bg-blue-600 flex items-center justify-center">
                    {profilePic ? (
                      <img
                        src={profilePic}
                        alt={name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-blue-800 text-white text-3xl font-bold flex items-center justify-center">
                        {getInitials(name)}
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-gray-700">
                    <h3 className="text-lg font-semibold">{name}</h3>
                    <p className="text-sm text-gray-500">{role}</p>
                    <p className="text-sm mt-2">{bio}</p>
                  </div>
                </div>
              ))}
            </div>
            {committee.advisors.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-semibold text-center mb-6">Advisors</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {committee.advisors.map(({ _id, name, bio, profilePic }) => (
                    <div
                      key={_id}
                      className="bg-white rounded-lg shadow overflow-hidden flex flex-col"
                    >
                      <div className="h-48 bg-blue-600 flex items-center justify-center">
                        {profilePic ? (
                          <img
                            src={profilePic}
                            alt={name}
                            className="w-24 h-24 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-blue-800 text-white text-3xl font-bold flex items-center justify-center">
                            {getInitials(name)}
                          </div>
                        )}
                      </div>
                      <div className="p-4 text-gray-700">
                        <h3 className="text-lg font-semibold">{name}</h3>
                        <p className="text-sm text-gray-500">Advisor</p>
                        <p className="text-sm mt-2">{bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

export default AllCommittees;
