import React from "react";
import BranchTemplate from "./BranchTemplate";

function MadheshBranch() {
  const branchData = {
    name: "Madhesh",
    address: "Janakpur, Madhesh Province, Nepal",
    mapLink: "https://www.google.com/maps?q=Janakpur,Nepal",
    description: `The Madhesh branch, situated in the historic city of Janakpur, serves as the southern regional center for REST. This branch plays a crucial role in supporting retired telecommunications professionals across the Terai region, with its rich cultural heritage and diverse communities.

Our Madhesh branch is uniquely positioned to address the specific needs of retired telecom employees in the plains region, where agriculture, trade, and cross-border activities create distinct opportunities and challenges. We focus on leveraging the telecommunications expertise of our members to support local economic development.

The branch is particularly active in community development projects and maintains strong connections with local government bodies and civil society organizations to ensure our members remain engaged and contribute meaningfully to regional development.`,
    contact: {
      phone: "+977-41-2345678",
      email: "madhesh@rest.org.np",
    },
    workingHours: "Sunday - Friday: 10:00 AM - 5:00 PM, Saturday: 10:00 AM - 2:00 PM",
    services: [
      {
        name: "Terai Region Coordination",
        description: "Coordinating services across Madhesh Province districts"
      },
      {
        name: "Agricultural Technology Integration",
        description: "Helping farmers adopt modern communication and agricultural technologies"
      },
      {
        name: "Cross-Border Trade Support",
        description: "Communication solutions for cross-border business activities"
      },
      {
        name: "Rural Connectivity Advisory",
        description: "Advising on rural telecommunications infrastructure development"
      },
      {
        name: "Cultural Heritage Documentation",
        description: "Using technology to preserve and promote local cultural heritage"
      },
      {
        name: "Emergency Communication Planning",
        description: "Disaster preparedness communication systems for flood-prone areas"
      }
    ],
    uniquePrograms: [
      {
        title: "Terai Digital Villages Initiative",
        description: "Transforming traditional villages into digitally connected communities with member expertise in telecommunications infrastructure.",
        schedule: "Monthly village visits and quarterly progress reviews"
      },
      {
        title: "Mithila Cultural Digital Archive",
        description: "Creating digital archives of Mithila art, culture, and traditions using modern technology with guidance from tech-savvy retired professionals.",
        schedule: "Ongoing project with weekly documentation sessions"
      },
      {
        title: "Border Communication Enhancement",
        description: "Working with authorities to improve communication systems along the Nepal-India border for better trade and security.",
        schedule: "Bi-monthly coordination meetings with border authorities"
      }
    ],
    teamMembers: [
      {
        name: "Ravi Ranjan Singh",
        position: "Branch Coordinator",
        experience: "Former DGM, Nepal Telecom Janakpur - 34 years experience"
      },
      {
        name: "Sunita Devi Shah",
        position: "Community Development Manager",
        experience: "Former Manager, Rural Development - 25 years experience"
      },
      {
        name: "Mohammad Alam Ansari",
        position: "Technology Integration Specialist",
        experience: "Telecommunications technology expert - 28 years experience"
      }
    ]
  };

  return <BranchTemplate branchData={branchData} />;
}

export default MadheshBranch;