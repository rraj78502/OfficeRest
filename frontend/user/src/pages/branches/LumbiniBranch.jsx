import React from "react";
import BranchTemplate from "./BranchTemplate";

function LumbiniBranch() {
  const branchData = {
    name: "Lumbini",
    address: "Butwal, Lumbini Province, Nepal",
    mapLink: "https://www.google.com/maps?q=Butwal,Nepal",
    description: `The Lumbini branch, headquartered in Butwal, serves the western Terai and hill regions of Nepal. This province, home to the birthplace of Lord Buddha, holds special significance as a center of peace, spirituality, and cultural heritage. Our branch works to honor this legacy while providing modern services to retired telecommunications professionals.

Located in Butwal, a major commercial and transportation hub of western Nepal, our branch serves as a gateway connecting the hills and plains. We focus on supporting industrial development, religious tourism, and agricultural modernization through appropriate telecommunications solutions.

Our unique position allows us to work with diverse communities, from industrial workers in Butwal and Siddharthanagar to farmers in rural areas, and pilgrims visiting the sacred sites of Lumbini. We strive to create inclusive programs that benefit all segments of society.`,
    contact: {
      phone: "+977-71-2345678",
      email: "lumbini@rest.org.np",
    },
    workingHours: "Sunday - Friday: 10:00 AM - 5:00 PM, Saturday: 10:00 AM - 3:00 PM",
    services: [
      {
        name: "Industrial Communication Solutions",
        description: "Supporting communication needs of industrial zones and factories"
      },
      {
        name: "Religious Tourism Technology",
        description: "Technology solutions for pilgrims visiting Lumbini and surrounding areas"
      },
      {
        name: "Agricultural Market Connectivity",
        description: "Connecting farmers with markets through mobile and digital platforms"
      },
      {
        name: "Peace Education Programs",
        description: "Using technology to promote peace education and Buddha's teachings"
      },
      {
        name: "Heritage Site Digital Preservation",
        description: "Digital documentation and preservation of cultural heritage sites"
      },
      {
        name: "Cross-Border Trade Support",
        description: "Communication solutions for Nepal-India border trade activities"
      }
    ],
    uniquePrograms: [
      {
        title: "Buddha Circuit Digital Experience",
        description: "Creating an integrated digital experience for pilgrims visiting Buddhist sites across Lumbini Province using mobile apps and audio guides.",
        schedule: "Year-round with special programs during Buddha Purnima"
      },
      {
        title: "Industrial Zone Connectivity Project",
        description: "Upgrading communication infrastructure in industrial zones to support Industry 4.0 initiatives with guidance from experienced telecom professionals.",
        schedule: "Quarterly assessments and continuous improvement projects"
      },
      {
        title: "Peace Technology Initiative",
        description: "Developing technology solutions that promote peace, meditation, and mindfulness, inspired by Buddhist principles.",
        schedule: "Monthly workshops and annual Peace Technology Conference"
      }
    ],
    teamMembers: [
      {
        name: "Keshab Raj Pandey",
        position: "Branch Coordinator",
        experience: "Former DGM, Nepal Telecom Butwal - 33 years experience"
      },
      {
        name: "Saraswati Sharma Poudel",
        position: "Heritage Technology Manager",
        experience: "Former Manager, Network Planning - 24 years experience"
      },
      {
        name: "Arjun Singh Thapa",
        position: "Industrial Relations Coordinator",
        experience: "Former Senior Engineer, Industrial Communications - 26 years"
      }
    ]
  };

  return <BranchTemplate branchData={branchData} />;
}

export default LumbiniBranch;