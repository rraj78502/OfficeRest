import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";

function Contact() {
  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0c1c35] to-[#13284c] text-white py-20 text-center">
        <h1 className="text-4xl font-bold">Contact Us</h1>
        <p className="text-lg mt-2">
          We're here to help and answer any questions you may have
        </p>
      </section>

      {/* Contact Cards */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12">Get In Touch</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Phone */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FaPhone className="text-xl text-gray-700" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Phone</h3>
            <p className="text-sm text-gray-800">+977-1-4271711</p>
            <p className="text-xs text-gray-500 mt-2">
              Call us during office hours for immediate assistance
            </p>
          </div>

          {/* Email */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FaEnvelope className="text-xl text-gray-700" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Email</h3>
            <p className="text-sm text-gray-800">info@rest.org.np</p>
            <p className="text-sm text-gray-800">support@rest.org.np</p>
            <p className="text-xs text-gray-500 mt-2">
              Send us an email and we'll respond within 24 hours
            </p>
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FaMapMarkerAlt className="text-xl text-gray-700" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Address</h3>
            <p className="text-sm text-gray-800">Deoneshwar Bhawan</p>
            <p className="text-sm text-gray-800">Bhadrakali Plaza, Kathmandu</p>
            <p className="text-sm text-gray-800">Nepal</p>
            <p className="text-xs text-gray-500 mt-2">
              Visit our central office for in-person assistance
            </p>
          </div>

          {/* Office Hours */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FaClock className="text-xl text-gray-700" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Office Hours</h3>
            <p className="text-sm text-gray-800">
              sun – Fri: 9:00 AM – 5:00 PM
            </p>
            <p className="text-sm text-gray-800">Saturday: Closed</p>
            <p className="text-xs text-gray-500 mt-2">
              We're here to help during working hours
            </p>
          </div>
        </div>
      </section>
      {/* contact form */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Location Info */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Find Us</h2>
            <div className="bg-gray-200 rounded-lg h-48 mb-6 flex flex-col items-center justify-center text-center text-gray-700">
              <svg
                className="w-6 h-6 mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3z" />
                <path d="M12 22s8-4.5 8-11a8 8 0 10-16 0c0 6.5 8 11 8 11z" />
              </svg>
              <div>
                <div className="font-medium">Interactive Map</div>
                <p className="text-sm">
                  Deoneshwar Bhawan, Bhadrakali Plaza,
                  <br />
                  Kathmandu, Nepal
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Directions</h3>
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li>5 minutes walk from Ratna Park Bus Station</li>
                <li>10 minutes from New Road</li>
                <li>Parking available on-site</li>
                <li>Wheelchair accessible entrance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* department contact */}
      <section className="bg-gray-50 px-6 py-20 text-gray-800">
        <h2 className="text-2xl font-bold text-center mb-12">
          Department Contacts
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {[
            {
              title: "General Information",
              description:
                "For general inquiries about our organization and services",
              email: "info@rest.org.np",
              phone: "+977-1-4271711",
            },
            {
              title: "Membership Services",
              description: "For membership-related questions and support",
              email: "membership@rest.org.np",
              phone: "+977-1-4271711",
            },
            {
              title: "Events & Activities",
              description: "For information about upcoming events and programs",
              email: "events@rest.org.np",
              phone: "+977-1-4271711",
            },
            {
              title: "Technical Support",
              description: "For website and digital service assistance",
              email: "tech@rest.org.np",
              phone: "+977-1-4271711",
            },
          ].map((dept, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-sm p-6 flex gap-4 items-start"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mt-1">
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5.121 17.804A13.937 13.937 0 0112 15c2.062 0 4.003.438 5.879 1.222M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 12c-2.21 0-4 1.79-4 4v.35c0 .09.01.17.02.26A8.96 8.96 0 0012 21a8.96 8.96 0 003.98-.89c.01-.09.02-.17.02-.26V16c0-2.21-1.79-4-4-4z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Content */}
              <div>
                <h3 className="font-semibold text-base">{dept.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{dept.description}</p>
                <p className="text-sm">
                  📧 <span className="text-gray-800">{dept.email}</span>
                </p>
                <p className="text-sm">
                  📞 <span className="text-gray-800">{dept.phone}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* emergency contact */}
      <section className="bg-red-50 px-6 py-16 text-center text-gray-800 border-t-2 border-red-300">
        <h2 className="text-xl font-bold mb-2">Emergency Contact</h2>
        <p className="mb-4">
          For urgent matters outside office hours, please contact our emergency
          line:
        </p>

        <div className="inline-flex items-center gap-3 justify-center">
          <div className="bg-white px-4 py-2 rounded shadow flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2.003 5.884l2-3.464A1 1 0 015 2h10a1 1 0 01.894.553l2 3.464A1 1 0 0118 7H2a1 1 0 01-.997-1.116zM2 8h16v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8z" />
            </svg>
            <span className="font-semibold text-black">+977-1-4271711</span>
          </div>
          <span className="text-sm text-gray-600">
            Available 24/7 for emergencies
          </span>
        </div>
      </section>
    </div>
  );
}

export default Contact;
