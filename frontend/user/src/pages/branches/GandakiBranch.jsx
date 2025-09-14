import React from "react";
import BranchTemplate from "./BranchTemplate";

function GandakiBranch() {
  const branchData = {
    name: "Gandaki",
    address: "Pokhara, Gandaki Province, Nepal",
    mapLink: "https://www.google.com/maps?q=Pokhara,Nepal",
    description: `The Gandaki branch, located in the scenic city of Pokhara, serves the mountainous and hill regions of central Nepal. Known for its stunning natural beauty and tourism industry, this region presents unique opportunities for retired telecommunications professionals to contribute to sustainable development.

Our Gandaki branch specializes in supporting eco-friendly tourism initiatives, mountain communication systems, and connecting remote hill communities with modern telecommunications infrastructure. We work closely with the tourism industry, local government, and international development agencies.

The branch is particularly focused on leveraging technology for environmental conservation, disaster management in mountainous terrains, and supporting the livelihoods of communities dependent on tourism and agriculture in the region.`,
    contact: {
      phone: "+977-61-2345678",
      email: "gandaki@rest.org.np",
    },
    workingHours: "Sunday - Friday: 9:30 AM - 5:30 PM",
    services: [
      {
        name: "Mountain Communication Systems",
        description: "Specialized communication solutions for mountainous terrain"
      },
      {
        name: "Tourism Technology Integration",
        description: "Supporting tourism industry with modern communication technologies"
      },
      {
        name: "Remote Area Connectivity",
        description: "Connecting isolated hill communities with telecommunications networks"
      },
      {
        name: "Disaster Management Communication",
        description: "Emergency communication systems for natural disaster preparedness"
      },
      {
        name: "Environmental Monitoring Technology",
        description: "Technology solutions for environmental conservation projects"
      },
      {
        name: "Adventure Tourism Safety Communication",
        description: "Communication systems for trekking and mountaineering safety"
      }
    ],
    uniquePrograms: [
      {
        title: "Annapurna Circuit Digital Trail",
        description: "Creating a comprehensive digital communication network along the Annapurna trekking circuit for tourist safety and local community connectivity.",
        schedule: "Seasonal installations - Pre-monsoon and Post-monsoon"
      },
      {
        title: "Lake Conservation Technology Initiative",
        description: "Using IoT and communication technologies to monitor and preserve the health of lakes including Phewa, Begnas, and Rupa lakes.",
        schedule: "Monthly monitoring and quarterly reports"
      },
      {
        title: "Hill Agriculture Modernization",
        description: "Introducing smart farming technologies and market connectivity solutions for hill farmers in Gandaki region.",
        schedule: "Seasonal agricultural support programs"
      }
    ],
    teamMembers: [
      {
        name: "Tej Bahadur Gurung",
        position: "Branch Coordinator",
        experience: "Former AGM, Nepal Telecom Pokhara - 31 years experience"
      },
      {
        name: "Purnima Thapa Magar",
        position: "Tourism Technology Coordinator",
        experience: "Former Senior Manager, Strategic Planning - 27 years experience"
      },
      {
        name: "David Kumar Shrestha",
        position: "Mountain Systems Specialist",
        experience: "Expert in high-altitude communication systems - 29 years experience"
      }
    ]
  };

  return <BranchTemplate branchData={branchData} />;
}

export default GandakiBranch;