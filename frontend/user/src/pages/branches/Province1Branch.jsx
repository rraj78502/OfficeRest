import React from "react";
import BranchTemplate from "./BranchTemplate";

function Province1Branch() {
  const branchData = {
    name: "Province 1",
    address: "Biratnagar, Province 1, Nepal",
    mapLink: "https://www.google.com/maps?q=Biratnagar,Nepal",
    description: `The Province 1 branch in Biratnagar serves as the eastern regional hub for the Nepal Telecommunication Retired Employees Society (REST). Located in the commercial capital of eastern Nepal, our branch focuses on empowering retired telecom employees through comprehensive skill development programs and active community engagement.

Our strategic location in Biratnagar enables us to effectively serve retired telecommunications professionals across the entire eastern region, including districts like Jhapa, Ilam, Panchthar, Taplejung, Sankhuwasabha, Terhathum, Dhankuta, Bhojpur, Khotang, Udayapur, and Sunsari.

The Province 1 branch is particularly known for its innovative approach to combining traditional support services with modern digital solutions, helping our members transition smoothly into retirement while maintaining their professional connections and contributing to their communities.`,
    contact: {
      phone: "+977-21-2345678",
      email: "province1@rest.org.np",
    },
    workingHours: "Sunday - Friday: 10:00 AM - 5:00 PM",
    services: [
      {
        name: "Regional Coordination",
        description: "Coordinating REST activities across eastern Nepal districts"
      },
      {
        name: "Skill Enhancement Workshops",
        description: "Regular workshops on emerging technologies and digital skills"
      },
      {
        name: "Community Development Projects",
        description: "Leading community development initiatives in rural eastern areas"
      },
      {
        name: "Healthcare Support Network",
        description: "Network of healthcare providers offering special rates for members"
      },
      {
        name: "Agricultural Technology Support",
        description: "Supporting members interested in modern farming and agri-tech"
      },
      {
        name: "Local Business Development",
        description: "Guidance for members starting small businesses in retirement"
      }
    ],
    uniquePrograms: [
      {
        title: "Eastern Hills Connectivity Project",
        description: "Collaborative project working with local government to improve internet connectivity in remote hill areas using member expertise.",
        schedule: "Ongoing - Site visits every 2 months"
      },
      {
        title: "Tea Garden Communication Network",
        description: "Special program helping tea garden communities in Ilam and Jhapa establish better communication networks leveraging member skills.",
        schedule: "Quarterly visits to tea estates"
      },
      {
        title: "Cross-Border Technology Exchange",
        description: "Cultural and technical exchange programs with retired telecom professionals from neighboring countries.",
        schedule: "Annual exchange program in December"
      }
    ],
    teamMembers: [
      {
        name: "Bishnu Prasad Limbu",
        position: "Regional Coordinator",
        experience: "Former AGM, Nepal Telecom Biratnagar - 32 years experience"
      },
      {
        name: "Maya Kumari Shrestha",
        position: "Community Relations Manager",
        experience: "Former Senior Manager, Rural Telecommunications - 26 years"
      },
      {
        name: "Rajesh Kumar Yadav",
        position: "Technical Advisor",
        experience: "Telecom infrastructure expert with 30+ years experience"
      }
    ]
  };

  return <BranchTemplate branchData={branchData} />;
}

export default Province1Branch;