const mongoose = require("mongoose");
const CommitteeMember = require("./model/committeeModel"); // Adjust path to your model
require("dotenv").config();

// Hardcoded data from AllCommittees.jsx
const committees = [
    {
      title: "Adopt Committee (2064/4/16 - 2065/5/27)",
      members: [
        { name: "Chet Prasad Bhattarai", role: "Chairman", bio: "Led the foundation of REST with a focus on retiree welfare and telecom contributions." },
        { name: "Chakra Lal Shrestha", role: "Vice Chairman", bio: "Supported retiree advocacy and policy development in telecommunications." },
        { name: "Sushil Kumar Poudyal", role: "Secretary", bio: "Coordinated early REST initiatives for training and retiree engagement." },
        { name: "Mukunda Raj Chlesay", role: "Assistant Secretary", bio: "Assisted in administrative efforts to promote retiree welfare programs." },
        { name: "Narayan Bahadur Shrestha", role: "Treasurer", bio: "Managed finances to support income-generating initiatives for retirees." },
        { name: "Baikuntha Prasad Parajuli", role: "Member", bio: "Contributed to skill-sharing and community outreach programs." },
        { name: "Mahan Bahadur Shrestha", role: "Member", bio: "Supported telecom-related training and retiree engagement." },
        { name: "Bijaya Lal Shrestha", role: "Member", bio: "Promoted welfare and national development through retiree expertise." },
        { name: "Shankar Bahadur Khadka", role: "Member", bio: "Advanced disaster response and skill-enhancement initiatives." },
        { name: "Sita Pokharel", role: "Member", bio: "Focused on community engagement and retiree support programs." },
        { name: "Gayatre Poudel", role: "Member", bio: "Enhanced retiree outreach and social development initiatives." },
        { name: "Hari Prasad Koirala", role: "Member", bio: "Contributed to telecom training and advocacy for retiree rights." },
        { name: "Narayan Bahadur K.C.", role: "Member", bio: "Supported skill-sharing and welfare programs for retirees." },
        { name: "Rajendra Baidya", role: "Member", bio: "Promoted collaboration with telecom institutions for consumer rights." },
      ],
      advisors: [
        { name: "Bhup Raj Panday", bio: "Provided strategic guidance for retiree welfare and telecom contributions." },
        { name: "Gagendra Sing Bora", bio: "Advised on policy development and retiree engagement strategies." },
        { name: "Kasab Bahadur Saha", bio: "Supported advocacy for retiree rights and entitlements." },
        { name: "Raghu Bar Lal Shrestha", bio: "Guided community outreach and disaster response initiatives." },
        { name: "Ratna Kagi Tuladhar", bio: "Contributed expertise to skill-enhancement programs." },
        { name: "Suresh Kumar Pudasini", bio: "Advised on telecom training and national development efforts." },
        { name: "Gopal Prasad Shrestha", bio: "Supported welfare and collaboration with telecom institutions." },
        { name: "Lalit Poudel", bio: "Guided REST’s mission for retiree engagement and advocacy." },
      ],
    },
    {
      title: "Central Working Committee (2065/5/27 - 2067/05/01)",
      members: [
        { name: "Chet Prasad Bhattarai", role: "Chairman", bio: "Led REST with a focus on retiree welfare and telecom contributions." },
        { name: "Chakra Lal Shrestha", role: "Vice Chairman", bio: "Supported advocacy for retiree rights and telecom policy." },
        { name: "Sushil Kumar Poudyal", role: "Secretary", bio: "Coordinated training and research programs for retirees." },
        { name: "Narayan Bahadur Shrestha", role: "Treasurer", bio: "Managed finances for income-generating retiree initiatives." },
        { name: "Ram Saran Khatri", role: "Member", bio: "Contributed to retiree welfare and advocacy efforts." },
        { name: "Shankar Bahadur Khadka", role: "Member", bio: "Supported disaster response and skill-sharing programs." },
        { name: "Sita Pokharel", role: "Member", bio: "Promoted community engagement and retiree support." },
        { name: "Jatha Kagi Shrestha", role: "Member", bio: "Contributed to training and telecom-related initiatives." },
        { name: "Ragendra Pokharel", role: "Member", bio: "Advanced retiree advocacy and national development." },
      ],
    },
    {
      title: "Central Working Committee (2067/05/01 - 2069/06/29)",
      members: [
        { name: "Chet Prasad Bhattarai", role: "Chairman", bio: "Continued leadership in retiree welfare and telecom contributions." },
        { name: "Sushil Kumar Poudyal", role: "Vice Chairman", bio: "Supported policy advocacy and retiree engagement." },
        { name: "Bijaya Lal Shrestha", role: "Secretary", bio: "Coordinated training and skill-enhancement programs." },
        { name: "Narayan Bahadur Shrestha", role: "Treasurer", bio: "Managed finances for retiree welfare initiatives." },
        { name: "Ram Saran Khatri", role: "Member", bio: "Contributed to advocacy and welfare programs." },
        { name: "Shankar Bahadur Khadka", role: "Member", bio: "Supported disaster response and training initiatives." },
        { name: "Bidya Saha", role: "Member", bio: "Promoted community outreach and retiree engagement." },
        { name: "Jatha Kagi Shrestha", role: "Member", bio: "Contributed to telecom training and advocacy." },
        { name: "Ragendra Pokharel", role: "Member", bio: "Advanced national development through retiree expertise." },
        { name: "Murari Prasad Panday", role: "Member", bio: "Supported skill-sharing and welfare initiatives." },
        { name: "Babu Ram Pokharel", role: "Member", bio: "Contributed to community engagement and telecom programs." },
      ],
    },
    {
      title: "Central Working Committee (2069/06/29 - 2073/07/24)",
      members: [
        { name: "Chet Prasad Bhattarai", role: "Chairman", bio: "Led REST with a focus on retiree welfare and national development." },
        { name: "Babu Ram Pokharel", role: "Vice Chairman", bio: "Supported retiree advocacy and policy development." },
        { name: "Krishna Prasad Pokharel", role: "Secretary", bio: "Coordinated training and research for retirees." },
        { name: "Narayan Bahadur Shrestha", role: "Treasurer", bio: "Managed finances for income-generating programs." },
        { name: "Ram Saran Khatri", role: "Member", bio: "Contributed to welfare and advocacy initiatives." },
        { name: "Chakra Lal Shrestha", role: "Member", bio: "Supported skill-sharing and telecom contributions." },
        { name: "Dilli Devi Tuladhar", role: "Member", bio: "Promoted community outreach and retiree engagement." },
        { name: "Ragendra Pokharel", role: "Member", bio: "Advanced national development through retiree expertise." },
        { name: "Bimal Kumar Karki", role: "Member", bio: "Supported financial and welfare initiatives for retirees." },
      ],
    },
    {
      title: "Central Working Committee (2069/07/29 - 2073/05/17)",
      members: [
        { name: "Chet Prasad Bhattarai", role: "Chairman", bio: "Led REST with dedication to retiree welfare and telecom growth." },
        { name: "Babu Ram Pokharel", role: "Vice Chairman", bio: "Supported advocacy and community engagement initiatives." },
        { name: "Ram Saran Khatri", role: "Secretary", bio: "Coordinated training and retiree support programs." },
        { name: "Surya Prasad Aryal", role: "Treasurer", bio: "Managed finances for retiree welfare and income programs." },
        { name: "Chakra Lal Shrestha", role: "Member", bio: "Contributed to skill-sharing and telecom initiatives." },
        { name: "Sushil Kumar Poudyal", role: "Member", bio: "Supported training and research for retirees." },
        { name: "Bijaya Lal Shrestha", role: "Member", bio: "Promoted welfare and national development programs." },
        { name: "Ragendra Pokharel", role: "Member", bio: "Advanced retiree advocacy and telecom contributions." },
        { name: "Bimal Kumar Karki", role: "Member", bio: "Supported financial and welfare initiatives." },
        { name: "Rupal Halder", role: "Member", bio: "Contributed to community outreach and disaster response." },
        { name: "Narayan Bahadur Shrestha", role: "Member", bio: "Supported income-generating and welfare programs." },
        { name: "Rama Shrestha", role: "Member", bio: "Promoted retiree engagement and social development." },
        { name: "Vishwo Nath Goel", role: "Member", bio: "Contributed to skill-enhancement and advocacy efforts." },
      ],
    },
    {
      title: "Central Working Committee (2073/05/17 - 2075/06/05)",
      members: [
        { name: "Vishwo Nath Goel", role: "Chairman", bio: "Led REST with a focus on retiree welfare and telecom contributions." },
        { name: "Kamal Prasad Bhattrai", role: "Vice Chairman", bio: "Supported advocacy and policy development for retirees." },
        { name: "Krishna Prasad Pokharel", role: "Secretary", bio: "Coordinated training and research initiatives." },
        { name: "Mahendra Raj Shrestha", role: "Treasurer", bio: "Managed finances for retiree welfare programs." },
        { name: "Diwakar Thapa", role: "Member", bio: "Supported administrative and training initiatives." },
        { name: "Murari Prasad Panday", role: "Member", bio: "Contributed to skill-sharing and welfare programs." },
        { name: "Bijaya Lal Shrestha", role: "Member", bio: "Promoted national development and retiree engagement." },
        { name: "Ragendra Kumar Pokharel", role: "Member", bio: "Advanced advocacy and telecom contributions." },
        { name: "Khamb Jung Saha", role: "Member", bio: "Supported disaster response and retiree welfare." },
        { name: "Bidya Saha", role: "Member", bio: "Promoted community outreach and engagement." },
        { name: "Jatha Kagi Shrestha", role: "Member", bio: "Contributed to training and advocacy initiatives." },
        { name: "Rabindra Nath Yadav", role: "Member", bio: "Supported retiree welfare and social development." },
        { name: "Ram Saran Khatri", role: "Member", bio: "Contributed to advocacy and welfare programs." },
      ],
    },
    {
      title: "Central Working Committee (2075/06/17 - 2077/06/15)",
      members: [
        { name: "Vishwo Nath Goel", role: "Chairman", bio: "Led REST with dedication to retiree welfare and telecom growth." },
        { name: "Kamal Prasad Bhattrai", role: "Vice Chairman", bio: "Supported retiree advocacy and policy initiatives." },
        { name: "Krishna Prasad Pokharel", role: "Secretary", bio: "Coordinated training and research programs." },
        { name: "Bimal Kumar Karki", role: "Treasurer", bio: "Managed finances for income-generating initiatives." },
        { name: "Diwakar Thapa", role: "Member", bio: "Supported administrative and training efforts." },
        { name: "Murari Prasad Panday", role: "Member", bio: "Contributed to skill-sharing and welfare programs." },
        { name: "Rabindra Jha", role: "Member", bio: "Supported retiree advocacy and community engagement." },
        { name: "Ragendra Kumar Pokharel", role: "Member", bio: "Advanced telecom contributions and advocacy." },
        { name: "Ashok Kumar Lal Karna", role: "Member", bio: "Promoted skill-enhancement and welfare programs." },
        { name: "Indira Gautam", role: "Member", bio: "Enhanced community outreach and engagement." },
        { name: "Raja Ram Sharma", role: "Member", bio: "Supported disaster response and training." },
        { name: "Bijaya Lal Shrestha", role: "Member", bio: "Promoted national development and welfare." },
        { name: "Ram Saran Khatri", role: "Member", bio: "Contributed to advocacy and welfare initiatives." },
      ],
    },
    {
      title: "Central Working Committee (2077/06/15 - 2079/05/07)",
      members: [
        { name: "Vishwo Nath Goel", role: "Chairman", bio: "Led REST with a focus on retiree welfare and telecom contributions." },
        { name: "Kamal Prasad Bhattrai", role: "Vice Chairman", bio: "Supported advocacy and community engagement." },
        { name: "Krishna Prasad Pokharel", role: "Secretary", bio: "Coordinated training and research initiatives." },
        { name: "Bimal Kumar Karki", role: "Treasurer", bio: "Managed finances for retiree welfare programs." },
        { name: "Diwakar Thapa", role: "Member", bio: "Supported administrative and training efforts." },
        { name: "Murari Prasad Panday", role: "Member", bio: "Contributed to skill-sharing and welfare initiatives." },
        { name: "Rabindra Jha", role: "Member", bio: "Supported retiree advocacy and engagement." },
        { name: "Ragendra Kumar Pokharel", role: "Member", bio: "Advanced telecom contributions and advocacy." },
        { name: "Ashok Kumar Lal Karna", role: "Member", bio: "Promoted skill-enhancement and welfare programs." },
        { name: "Indira Gautam", role: "Member", bio: "Enhanced community outreach and engagement." },
        { name: "Raja Ram Sharma", role: "Member", bio: "Supported disaster response and training." },
        { name: "Bijaya Lal Shrestha", role: "Member", bio: "Promoted national development and welfare." },
        { name: "Ram Saran Khatri", role: "Member", bio: "Contributed to advocacy and welfare initiatives." },
      ],
    },
    {
      title: "Central Working Committee (2079/05/07 - 2081/09/20)",
      members: [
        { name: "Kesab Bahadur Saha", role: "Chairman", bio: "Led REST with dedication to retiree welfare and telecom growth." },
        { name: "Rabindra Jha", role: "Vice Chairman", bio: "Supported advocacy and community engagement initiatives." },
        { name: "Krishna Prasad Pokharel", role: "Secretary", bio: "Coordinated training and research programs." },
        { name: "Bimal Kumar Karki", role: "Treasurer", bio: "Managed finances for income-generating initiatives." },
        { name: "Diwakar Thapa", role: "Member", bio: "Supported administrative and training efforts." },
        { name: "Laxman Lal Shrestha", role: "Member", bio: "Contributed to welfare and skill-sharing programs." },
        { name: "Ram Sing Thapa", role: "Member", bio: "Supported disaster response and retiree engagement." },
        { name: "Ragendra Kumar Pokharel", role: "Member", bio: "Advanced telecom contributions and advocacy." },
        { name: "Ashok Kumar Lal Karna", role: "Member", bio: "Promoted skill-enhancement and welfare programs." },
        { name: "Bidya Saha", role: "Member", bio: "Enhanced community outreach and engagement." },
        { name: "Raja Ram Sharma", role: "Member", bio: "Supported disaster response and training." },
        { name: "Badri Prasad Bastola", role: "Member", bio: "Contributed to retiree welfare and advocacy." },
        { name: "Ram Saran Khatri", role: "Member", bio: "Supported advocacy and welfare initiatives." },
      ],
    },
    {
      title: "Central Working Committee (2081/09/20 - Current)",
      members: [
        { name: "Rabindra Jha", role: "Chairman", bio: "Leading REST with 25+ years in telecommunications, driving welfare protection and skill-enhancement programs." },
        { name: "Krishna Prasad Pokharel", role: "Vice Chairman", bio: "Advocating for retiree rights and telecom policy development." },
        { name: "Diwakar Thapa", role: "Secretary", bio: "20 years in administrative management, coordinating training and research." },
        { name: "Bimal Kumar Karki", role: "Treasurer", bio: "Financial management specialist focused on entitlements and income-generating initiatives." },
        { name: "Bishnu Prasad Khakurel", role: "Member", bio: "Supporting retiree welfare and skill-sharing programs." },
        { name: "Kumar Prasad Khatewada", role: "Member", bio: "Contributing to community engagement and disaster response." },
        { name: "Raju Babu Aryal", role: "Member", bio: "Promoting training and research for retiree expertise." },
        { name: "Sarmit Kumar Poudyal", role: "Member", bio: "Advancing retiree advocacy and collaboration." },
        { name: "Ashok Kumar Lal Karna", role: "Member", bio: "Driving skill-enhancement and welfare programs." },
        { name: "Bidya Saha", role: "Member", bio: "Enhancing community outreach and retiree engagement." },
        { name: "Raja Ram Sharma", role: "Member", bio: "Supporting disaster response and training programs." },
        { name: "Ram Saran Khatri", role: "Member", bio: "Contributing to retiree welfare and advocacy." },
        { name: "Ram Giri", role: "Member", bio: "Promoting skill-sharing and national development." },
      ],
    },
  ];

// Function to extract startDate and endDate from committee title
const extractDates = (title) => {
  const dateMatch = title.match(/\((\d{4}\/\d{1,2}\/\d{1,2}) - (\d{4}\/\d{1,2}\/\d{1,2}|Current)\)/);
  if (dateMatch) {
    return {
      startDate: dateMatch[1],
      endDate: dateMatch[2],
    };
  }
  return { startDate: "", endDate: "" }; // Fallback (though all titles should have dates)
};

// Transform data into CommitteeMember schema format
const transformData = () => {
  const committeeMembers = [];

  committees.forEach((committee) => {
    const { startDate, endDate } = extractDates(committee.title);

    // Process members
    committee.members.forEach((member) => {
      committeeMembers.push({
        name: member.name,
        role: member.role,
        bio: member.bio,
        committeeTitle: committee.title,
        startDate,
        endDate,
        profilePic: "",
        userId: null,
      });
    });

    // Process advisors (if any)
    if (committee.advisors) {
      committee.advisors.forEach((advisor) => {
        committeeMembers.push({
          name: advisor.name,
          role: "Advisor",
          bio: advisor.bio,
          committeeTitle: committee.title,
          startDate,
          endDate,
          profilePic: "",
          userId: null,
        });
      });
    }
  });

  return committeeMembers;
};

// MongoDB connection and migration
const migrateData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Clear existing CommitteeMember data (optional, comment out if you want to append)
    await CommitteeMember.deleteMany({});
    console.log("Cleared existing CommitteeMember data");

    // Transform and insert data
    const committeeMembers = transformData();
    await CommitteeMember.insertMany(committeeMembers);
    console.log(`Successfully inserted ${committeeMembers.length} committee members`);

    // Close connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

// Run migration
migrateData();
