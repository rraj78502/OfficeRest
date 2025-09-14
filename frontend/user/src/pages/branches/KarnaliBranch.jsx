import React from "react";
import BranchTemplate from "./BranchTemplate";

function KarnaliBranch() {
  const branchData = {
    name: "Karnali",
    address: "Birendranagar, Karnali Province, Nepal",
    mapLink: "https://www.google.com/maps?q=Birendranagar,Nepal",
    description: `The Karnali branch, located in Birendranagar, serves Nepal's largest but least populated province. This remote and mountainous region presents unique challenges and opportunities for telecommunications development. Our branch focuses on bridging the digital divide and bringing connectivity to some of Nepal's most remote communities.

As the newest provincial capital, Birendranagar represents the government's commitment to balanced development across Nepal. Our branch works closely with provincial government initiatives, international development agencies, and local communities to ensure that telecommunications infrastructure reaches every corner of this vast province.

The Karnali branch is particularly focused on innovative solutions for extreme terrain, solar-powered communication systems, and satellite connectivity. We pioneer approaches that can later be replicated in other challenging geographical areas across Nepal and beyond.`,
    contact: {
      phone: "+977-83-2345678",
      email: "karnali@rest.org.np",
    },
    workingHours: "Sunday - Friday: 10:00 AM - 4:30 PM",
    services: [
      {
        name: "Remote Area Connectivity Solutions",
        description: "Specialized solutions for connecting isolated mountain communities"
      },
      {
        name: "Solar-Powered Communication Systems",
        description: "Sustainable communication solutions using renewable energy"
      },
      {
        name: "Satellite Technology Integration",
        description: "Satellite-based communication services for extreme terrain"
      },
      {
        name: "Emergency Communication Networks",
        description: "Disaster-resistant communication systems for remote areas"
      },
      {
        name: "Digital Health Support",
        description: "Telemedicine and digital health solutions for remote communities"
      },
      {
        name: "Educational Technology Outreach",
        description: "Bringing digital education to remote schools and communities"
      }
    ],
    uniquePrograms: [
      {
        title: "Extreme Terrain Communication Challenge",
        description: "Developing innovative communication solutions for the most challenging geographical conditions in Nepal, including high-altitude areas and remote valleys.",
        schedule: "Seasonal expeditions - Post-monsoon and Spring seasons"
      },
      {
        title: "Solar Communication Network Project",
        description: "Creating a network of solar-powered communication hubs across Karnali Province to ensure sustainable connectivity in off-grid areas.",
        schedule: "Ongoing installation with quarterly maintenance cycles"
      },
      {
        title: "Digital Nomad Remote Work Initiative",
        description: "Enabling remote work opportunities for educated youth in Karnali through reliable internet connectivity, preventing migration to cities.",
        schedule: "Monthly skill development sessions and quarterly job fairs"
      }
    ],
    teamMembers: [
      {
        name: "Dhan Bahadur Budha",
        position: "Branch Coordinator",
        experience: "Former AGM, Nepal Telecom - Remote area specialist - 30 years"
      },
      {
        name: "Kamala Sharma Oli",
        position: "Renewable Energy Technology Coordinator",
        experience: "Former Manager, Alternative Technology - 23 years experience"
      },
      {
        name: "Purna Bahadur Rokaya",
        position: "Mountain Communication Specialist",
        experience: "Expert in high-altitude communication systems - 28 years"
      }
    ]
  };

  return <BranchTemplate branchData={branchData} />;
}

export default KarnaliBranch;