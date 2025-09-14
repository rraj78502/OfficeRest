import React from "react";
import BranchTemplate from "./BranchTemplate";

function SudurpashchimBranch() {
  const branchData = {
    name: "Sudurpashchim",
    address: "Dhangadhi, Sudurpashchim Province, Nepal",
    mapLink: "https://www.google.com/maps?q=Dhangadhi,Nepal",
    description: `The Sudurpashchim branch, located in Dhangadhi, serves Nepal's far-western region. This strategically important area borders India on three sides and plays a crucial role in Nepal's international relations and trade. Our branch focuses on leveraging telecommunications technology to support cross-border activities, regional development, and connecting remote communities.

Dhangadhi, as the provincial headquarters, is emerging as a major economic center in far-western Nepal. Our branch works to support this growth while ensuring that the benefits of modern telecommunications reach rural and remote areas of the province, including the challenging terrain of the far-western hills and mountains.

The Sudurpashchim branch is particularly noted for its work in cross-border communication systems, supporting seasonal migration patterns, and creating technology solutions that respect and preserve the rich cultural diversity of the region.`,
    contact: {
      phone: "+977-91-2345678",
      email: "sudurpashchim@rest.org.np",
    },
    workingHours: "Sunday - Friday: 10:00 AM - 5:00 PM, Saturday: 10:00 AM - 2:00 PM",
    services: [
      {
        name: "Cross-Border Communication Systems",
        description: "Supporting communication needs across Nepal-India border areas"
      },
      {
        name: "Seasonal Migration Support",
        description: "Communication solutions for seasonal workers and migrants"
      },
      {
        name: "Remote Hills Connectivity",
        description: "Connecting isolated hill communities in far-western Nepal"
      },
      {
        name: "Agricultural Export Technology",
        description: "Technology solutions for agricultural exports and trade"
      },
      {
        name: "Cultural Preservation Digital Projects",
        description: "Digital preservation of local languages and cultural practices"
      },
      {
        name: "Border Security Communication",
        description: "Supporting border security with improved communication systems"
      }
    ],
    uniquePrograms: [
      {
        title: "Three-Border Connectivity Initiative",
        description: "Creating robust communication networks in areas where Nepal meets India and China, facilitating trade and cultural exchange while ensuring security.",
        schedule: "Monthly border area assessments and quarterly stakeholder meetings"
      },
      {
        title: "Doteli Language Digital Preservation",
        description: "Using technology to preserve and promote the Doteli language and other local languages through digital archives and educational content.",
        schedule: "Weekly documentation sessions and quarterly cultural events"
      },
      {
        title: "Seasonal Worker Communication Network",
        description: "Providing communication solutions for workers who migrate seasonally to India, helping them stay connected with families and access services.",
        schedule: "Pre-migration setup (October-November) and return support (March-April)"
      }
    ],
    teamMembers: [
      {
        name: "Narayan Singh Dhami",
        position: "Branch Coordinator",
        experience: "Former DGM, Nepal Telecom Dhangadhi - 35 years experience"
      },
      {
        name: "Ganga Devi Bhatt",
        position: "Cross-Border Relations Manager",
        experience: "Former Manager, International Relations - 27 years experience"
      },
      {
        name: "Lok Bahadur Chand",
        position: "Cultural Technology Specialist",
        experience: "Expert in technology for cultural preservation - 25 years"
      }
    ]
  };

  return <BranchTemplate branchData={branchData} />;
}

export default SudurpashchimBranch;