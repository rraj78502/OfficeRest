// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import logo from "../../assets/logo.jpg";

function Footer() {
  const links = [
    { name: "About Us", path: "/aboutus" },
    { name: "Events", path: "/events" },
    { name: "Gallery", path: "/gallery" },
    { name: "Submit Photos", path: "/gallery" }, // adjust path if needed
    { name: "Contact", path: "/contact" },
    { name: "Membership", path: "/membership" },
    { name: "Login", path: "/login" },
  ];

  return (
    <footer className="bg-[#0c1c35] text-gray-300 py-10 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Logo and Address */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <img src={logo} alt="REST Logo" className="w-10 h-10" />
            <h2 className="text-white font-bold text-xl">R.E.S.T</h2>
          </div>
          <p className="text-sm">Central Office</p>
          <p className="text-sm">
            Babarmahal, Kathmandu, Nepal
          </p>
          <p className="text-xs mt-2">
            © 2024 R.E.S.T. All Rights Reserved.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1 text-sm">
            {links.map((link) => (
              <li key={link.name}>
                <Link to={link.path} className="hover:underline">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white font-semibold mb-2">Contact Info</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <FaPhone className="text-white" /> +977-1-4794225
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope className="text-white" /> rest@ntc.net.np
            </li>
            <li className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-white" /> Kathmandu, Nepal
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
