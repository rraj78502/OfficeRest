import { useState, useEffect } from "react";
import { FaUsers, FaBuilding, FaHandsHelping, FaLightbulb, FaBullseye, FaAward } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import rest from "../assets/rest.jpg";

function About() {
  const [currentCommittee, setCurrentCommittee] = useState([]);
  const [chairman, setChairman] = useState(null);

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

  // Fetch current committee members and chairman
  useEffect(() => {
    const fetchCurrentCommittee = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/committee-members?committeeTitle=Central Working Committee (2081/09/20 - Current)`,
          { withCredentials: true }
        );


        setCurrentCommittee(response.data.data);
        const chairmanData = response.data.data.find((member) => member.role === "Chairman");
        setChairman(chairmanData || null);
      } catch (error) {
        // Don't show error toast for 404 (no committee members found)
        if (error.response?.status !== 404) {
          toast.error("Failed to load committee members. Please try again later.");
        }
        console.log("No committee members found or error fetching:", error.response?.data?.message);
        setCurrentCommittee([]);
        setChairman(null);
      }
    };
    fetchCurrentCommittee();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section
        className="py-20"
        style={{
          backgroundImage: `url(${rest})`,
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
          backgroundRepeat: "no-repeat",
          backgroundBlendMode: "overlay",
          position: "relative",
          minHeight: "80vh",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30"></div>
        <div className="relative z-10">
          <div className="container mx-auto px-6 text-center text-white">
            <h1
              className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
              style={{
                textShadow: "2px 2px 8px rgba(0, 0, 0, 0.7), 0 0 25px rgba(0, 0, 0, 0.5)",
                opacity: 0.95,
              }}
            >
              Nepal Telecommunication Retired Employees Society (REST)
            </h1>
            <p
              className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
              style={{
                textShadow: "1px 1px 6px rgba(0, 0, 0, 0.7)",
                opacity: 0.90,
              }}
            >
              Safeguarding the welfare of retired telecom professionals and harnessing their expertise for national development.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="px-6 py-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h1 className="text-3xl font-bold mb-6">Welcome to Nepal Telecommunication Retired Employees Society (REST)</h1>
            <p className="mb-4">
              The <strong>Nepal Telecommunication Retired Employees Society (REST)</strong> was established to safeguard and promote the welfare of former employees retired from Nepal Telecommunications Corporation and Nepal Telecom, who receive retirement benefits or pensions.
            </p>
            <p className="mb-4">
              We honor these individuals for their service and encourage their continued contribution to the telecommunications sector and social development. Through income-generating and skill-enhancement programs, we harness the knowledge, expertise, and insights of retirees for national development.
            </p>
            <p className="">
              REST serves as a platform to recognize the value of our members and ensure their meaningful engagement post-retirement. Retirement is not an end but a new beginning for growth, contribution, and community support.
            </p>
          </div>
          <div className="space-y-6">
            {[
              {
                icon: <FaUsers size={24} />,
                title: "Non-Profit Social Organization",
                desc: "A public interest organization dedicated to the welfare of over 500+ retired telecom professionals across Nepal.",
              },
              {
                icon: <FaBuilding size={24} />,
                title: "Rights and Welfare Protection",
                desc: "Advocating for the rights, interests, and entitlements of former employees, with headquarters in Kathmandu and nationwide outreach.",
              },
              {
                icon: <FaHandsHelping size={24} />,
                title: "Skill Enhancement and Engagement",
                desc: "Programs for training, research, and utilizing retired expertise in telecommunications, including collaborations for national development.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="border border-gray-700 rounded-lg p-5">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-sm">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vision, Mission, Values Section */}
        <section className="py-16 px-6 mt-20 rounded-lg">
          <h2 className="text-3xl font-bold text-center mb-12">Vision, Mission, and Values</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <FaLightbulb size={36} className="text-yellow-400 mb-4" />,
                title: "Vision",
                text: "To create a supportive platform where retired telecommunications professionals can thrive, share their expertise, and contribute to national development and social welfare.",
              },
              {
                icon: <FaBullseye size={36} className="text-blue-400 mb-4" />,
                title: "Mission",
                text: "To safeguard the welfare of retired employees through income-generating programs, skill enhancement, advocacy for rights, and facilitation of their involvement in telecom-related initiatives and disaster response.",
              },
              {
                icon: <FaAward size={36} className="text-green-400 mb-4" />,
                title: "Values",
                text: "We value respect, integrity, community support, and the wisdom of experience. Our commitment includes honoring contributions, promoting entitlements, and collaborating with similar organizations for consumer rights and sector coordination.",
              },
            ].map(({ icon, title, text }) => (
              <div key={title} className="border border-gray-700 p-6 rounded-lg text-center">
                {icon}
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-sm">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Members Section */}
        <section className="py-20 px-6 bg-gray-50">
          <h2 className="text-3xl font-bold text-center mb-12">Our Central Working Committee</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {currentCommittee.map(({ _id, name, role, bio, profilePic }) => (
              <div
                key={_id}
                className="bg-white rounded-lg shadow overflow-hidden flex flex-col items-center"
              >
                <div className="mt-6 mb-2 flex items-center justify-center">
                  {profilePic ? (
                    <img src={profilePic} alt={name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-300 text-gray-700 text-xl font-bold flex items-center justify-center">
                      {getInitials(name)}
                    </div>
                  )}
                </div>
                <div className="p-4 text-gray-700 text-center">
                  <h3 className="text-lg font-semibold">{name}</h3>
                  <p className="text-sm text-gray-500">{role}</p>
                  <p className="text-sm mt-2">{bio}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/committees"
              className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              View All Working Committees
            </Link>
          </div>
        </section>

        {/* Message from Chairman */}
        <section className="py-20 px-6 bg-white text-gray-800">
          <h2 className="text-3xl font-bold text-center mb-12">Message from Our Chairman</h2>
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2 space-y-6">
              <p className="font-semibold">Respected members, greetings and salutations!</p>
              <p>It brings me immense joy to welcome you to our Nepal Telecommunication Retired Employees Society (REST) website. Retirement is not an end but a new beginning for continued contribution to the telecommunications sector and national development.</p>
              <p>Our Society honors the service of retired employees from Nepal Telecom, safeguarding their welfare through programs that harness their knowledge and expertise. We protect rights, promote entitlements, and facilitate engagement in training, research, and disaster response.</p>
              <p>Through REST, we advocate for representation in Nepal Telecom initiatives and collaborate with similar organizations to enhance consumer rights and social services.</p>
              <p>I encourage you to participate in our events, share your experiences, and help build a stronger community that ensures meaningful post-retirement involvement.</p>
              <p className="font-semibold">Thank you for being part of this wonderful journey.</p>
              <div>
                <p className="font-bold">{chairman?.name || "Chairman"}</p>
                <p>Chairman, REST</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg shadow text-center p-6">
              <div className="w-32 h-32 rounded-full bg-blue-600 text-white text-3xl font-bold flex items-center justify-center mx-auto mb-4">
                {chairman ? getInitials(chairman.name) : "N/A"}
              </div>
              <h3 className="text-xl font-semibold">{chairman?.name || "Chairman"}</h3>
              <p className="text-sm text-gray-500 mb-2">Chairman</p>
              <p className="text-sm text-gray-600">
                {chairman?.bio || "Leading REST with dedication to retiree welfare and community excellence"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default About;
