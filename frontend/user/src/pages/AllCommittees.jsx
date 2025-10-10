import { useState, useEffect } from "react";
import axios from "axios";
import { FaUsers } from "react-icons/fa";
import { toast } from "react-toastify";

const normalizeDateToken = (token) => {
  if (!token && token !== 0) return null;
  const cleaned = token.toString().trim();
  if (!cleaned) return null;
  if (/^\d+$/.test(cleaned)) {
    return cleaned.padStart(2, "0");
  }
  // Fall back to original token for non-numeric segments (e.g., Nepali month names)
  return cleaned;
};

const buildIsoLikeDate = (value) => {
  if (!value) return null;
  const trimmed = value.toString().trim();
  if (!trimmed) return null;
  if (trimmed.toLowerCase() === "current") return "Current";

  // Attempt ISO parsing first; fallback to manual token parsing
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = (parsed.getMonth() + 1).toString().padStart(2, "0");
    const day = parsed.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const segments = trimmed.split(/[-/]/).map(normalizeDateToken).filter(Boolean);
  if (segments.length === 3) {
    return `${segments[0]}-${segments[1]}-${segments[2]}`;
  }

  return trimmed;
};

const buildTenureLabel = (member) => {
  const startLabel = buildIsoLikeDate(member.startDate) || "Start date not set";
  const endLabel = buildIsoLikeDate(member.endDate) || "Present";
  return `${startLabel} - ${endLabel}`;
};

function AllCommittees() {
  const [selectedCommittee, setSelectedCommittee] = useState("All");
  const [selectedTenure, setSelectedTenure] = useState("All");
  const [committees, setCommittees] = useState([]);
  const [committeeOptions, setCommitteeOptions] = useState(["All"]);
  const [tenureOptions, setTenureOptions] = useState(["All"]);
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
        const titles = [...new Set(members.map((m) => m.committeeTitle).filter(Boolean))];
        setCommitteeOptions(["All", ...titles]);

        // Extract unique tenures (full start-end strings)
        const tenures = [
          ...new Set(
            members
              .map((member) => buildTenureLabel(member))
              .filter(Boolean)
          ),
        ];
        setTenureOptions(["All", ...tenures]);
      } catch (error) {
        toast.error("Failed to load committee members. Please try again later.");
        console.error("Error fetching committee members:", error);
      }
    };
    fetchData();
  }, []);

  // Filter/group members whenever filters change
  useEffect(() => {
    if (!allMembers.length) return;

    // Filter by committee title
    const filteredByCommittee =
      selectedCommittee === "All"
        ? allMembers
        : allMembers.filter((m) => m.committeeTitle === selectedCommittee);

    // Filter by tenure range (start-end string)
    const filtered =
      selectedTenure === "All"
        ? filteredByCommittee
        : filteredByCommittee.filter((member) => buildTenureLabel(member) === selectedTenure);

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
  }, [selectedCommittee, selectedTenure, allMembers]);

  return (
    <div className="px-6 py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12">All Working Committees</h1>
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-center">
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-600">Committee</label>
            <select
              value={selectedCommittee}
              onChange={(e) => setSelectedCommittee(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 text-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {committeeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-600">Tenure</label>
            <select
              value={selectedTenure}
              onChange={(e) => setSelectedTenure(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 text-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {tenureOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
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
