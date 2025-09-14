import React from "react";
import BranchTemplate from "./BranchTemplate";

function CentralBranch() {
  const branchData = {
    name: "Central",
    address: "Sundhara, Kathmandu, Bagmati Province",
    mapLink: "https://www.google.com/maps?q=Sundhara,Kathmandu",
    description: `The Central branch, located in the heart of Kathmandu, serves as the headquarters of the Nepal Telecommunication Retired Employees Society (REST). As the main coordinating center, it oversees nationwide initiatives and provides comprehensive support to retired telecom professionals throughout Nepal.

Our central office plays a pivotal role in policy formulation, strategic planning, and ensuring unified service delivery across all provincial branches. We maintain strong connections with government agencies, international organizations, and private sector partners to advocate for the rights and welfare of our members.

The Central branch also houses our main administrative offices, training facilities, and resource centers, making it a hub for knowledge sharing and professional development among retired telecommunications personnel.`,
    contact: {
      phone: "+977-1-4234567",
      email: "central@rest.org.np",
    },
    workingHours: "Sunday - Friday: 9:00 AM - 5:00 PM",
    services: [
      {
        name: "Membership Registration",
        description: "Complete registration process for new members joining REST nationwide"
      },
      {
        name: "Pension Advisory",
        description: "Guidance on pension-related matters and government benefits"
      },
      {
        name: "Legal Consultation",
        description: "Legal advice on employment rights and retirement benefits"
      },
      {
        name: "Health Services Coordination",
        description: "Coordination with healthcare providers for member benefits"
      },
      {
        name: "Skills Development Programs",
        description: "Professional development and training programs for members"
      },
      {
        name: "Advocacy & Representation",
        description: "Representing member interests with government and organizations"
      }
    ],
    uniquePrograms: [
      {
        title: "National Policy Advocacy",
        description: "Leading nationwide advocacy efforts for retired telecom employees' rights and benefits with government agencies and policymakers.",
        schedule: "Ongoing initiative with quarterly policy reviews"
      },
      {
        title: "Digital Literacy for Seniors",
        description: "Comprehensive digital skills training program helping retired professionals stay connected with modern technology and communication tools.",
        schedule: "Monthly workshops - First Saturday of each month"
      },
      {
        title: "REST Annual Conference",
        description: "Organizing the national annual conference bringing together all branches and stakeholders to discuss challenges, achievements, and future strategies.",
        schedule: "Annually in October"
      }
    ],
    teamMembers: [
      {
        name: "Ram Prasad Sharma",
        position: "Branch Coordinator",
        experience: "Former DGM, Nepal Telecom - 35 years experience"
      },
      {
        name: "Sita Devi Thapa",
        position: "Program Manager",
        experience: "Former Manager, Nepal Telecom - 28 years experience"
      },
      {
        name: "Krishna Bahadur Rai",
        position: "Legal Advisor",
        experience: "Legal expert specializing in telecommunications law"
      }
    ]
  };

  return <BranchTemplate branchData={branchData} />;
}

export default CentralBranch;