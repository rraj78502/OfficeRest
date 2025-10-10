import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import rest from "../../assets/rest.jpg";
import rest2 from "../../assets/rest.jpeg";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaUsers, FaClock, FaServicestack } from "react-icons/fa";

const api_base_url = import.meta.env.VITE_API_URL;

function BranchTemplate({ branchData }) {
  const {
    name,
    slug,
    address,
    mapLink,
    description,
    contact,
    services = [],
    workingHours = "Sunday - Friday: 10:00 AM - 5:00 PM",
    teamMembers = [],
    uniquePrograms = [],
  } = branchData;

  // Carousel state management
  const [carouselImages, setCarouselImages] = useState([rest, rest2]); // Default fallback images
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [carouselLoading, setCarouselLoading] = useState(true);

  // Fetch carousel images for this specific branch
  useEffect(() => {
    const fetchCarouselImages = async () => {
      try {
        setCarouselLoading(true);
        const branchKey =
          slug ||
          (name
            ? name
                .toLowerCase()
                .replace(/\s+/g, "")
                .replace(/[^a-z0-9]/g, "")
            : "");
        if (!branchKey) {
          console.warn("Branch carousel lookup skipped: missing branch identifier");
          setCarouselLoading(false);
          return;
        }
        const response = await axios.get(
          `${api_base_url}/api/v1/carousel/get-all-carousels?type=branch&branch=${branchKey}`,
          { withCredentials: true }
        );
        
        if (response.data.success && response.data.data.length > 0) {
          // Get all images from all active branch carousels for this branch
          const allImages = response.data.data
            .filter(carousel => carousel.isActive)
            .flatMap(carousel => carousel.images.map(img => img.url));
          
          if (allImages.length > 0) {
            setCarouselImages(allImages);
          }
        }
      } catch (err) {
        console.error("Error fetching carousel images for branch:", err);
        // Keep default fallback images
      } finally {
        setCarouselLoading(false);
      }
    };

    if (name) {
      fetchCarouselImages();
    }
  }, [name, slug]);

  // Start slideshow after 5s, then cycle every few seconds
  useEffect(() => {
    if (carouselImages.length <= 1) return; // No slideshow if only one photo

    const startTimer = setTimeout(() => {
      setCurrentPhoto((c) => (c + 1) % carouselImages.length);
      const cycle = setInterval(() => {
        setCurrentPhoto((c) => (c + 1) % carouselImages.length);
      }, 4000); // cycle every 4 seconds
      // Store cycle on window for cleanup within this closure
      window.__branch_cycle = cycle;
    }, 5000); // wait 5 seconds before first transition

    return () => {
      clearTimeout(startTimer);
      if (window.__branch_cycle) {
        clearInterval(window.__branch_cycle);
        delete window.__branch_cycle;
      }
    };
  }, [carouselImages.length]);

  return (
    <>

      {/* Image Carousel Section */}
      <section className="py-8 px-6">
        <div className="max-w-6xl mx-auto p-4 bg-white/5 rounded-xl shadow-lg">
          <div className="relative overflow-hidden rounded-lg aspect-[16/9]">
            {carouselLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <p className="text-gray-600">Loading carousel...</p>
              </div>
            ) : (
              carouselImages.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`${name} branch photograph`}
                  className={
                    `absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ` +
                    (idx === currentPhoto ? 'opacity-100' : 'opacity-0')
                  }
                />
              ))
            )}
            {/* Gradient overlays for polish */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/10 to-transparent" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          
          {/* Branch Description */}
          <div className="grid md:grid-cols-2 gap-12 items-start mb-20 px-4">
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-6">
                Welcome to the {name} Branch
              </h1>
              <div className="prose max-w-none">
                {description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6 p-6">
              {[
                {
                  icon: <FaMapMarkerAlt size={24} className="text-blue-600" />,
                  title: "Location",
                  desc: address,
                },
                {
                  icon: <FaPhone size={24} className="text-green-600" />,
                  title: "Contact",
                  desc: contact.phone,
                },
                {
                  icon: <FaEnvelope size={24} className="text-red-600" />,
                  title: "Email",
                  desc: contact.email,
                },
                {
                  icon: <FaClock size={24} className="text-purple-600" />,
                  title: "Working Hours",
                  desc: workingHours,
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                      <p className="text-gray-600">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Services Section */}
          {services.length > 0 && (
            <div className="mb-20 px-4">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 px-6">
                <FaServicestack className="text-blue-600" />
                Our Services
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
                {services.map((service, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                    <h3 className="font-semibold text-gray-800 mb-2">{service.name}</h3>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unique Programs Section */}
          {uniquePrograms.length > 0 && (
            <div className="mb-20 px-4">
              <h2 className="text-2xl font-bold mb-8 px-6">Special Programs & Initiatives</h2>
              <div className="grid md:grid-cols-2 gap-8 px-6">
                {uniquePrograms.map((program, index) => (
                  <div key={index} className="border-l-4 border-blue-600 pl-6">
                    <h3 className="font-semibold text-xl mb-3">{program.title}</h3>
                    <p className="text-gray-600 mb-2">{program.description}</p>
                    {program.schedule && (
                      <p className="text-sm text-blue-600 font-medium">{program.schedule}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Members Section */}
          {teamMembers.length > 0 && (
            <div className="mb-20 px-4">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 px-6">
                <FaUsers className="text-green-600" />
                Our Team
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
                {teamMembers.map((member, index) => (
                  <div key={index} className="text-center bg-white rounded-lg shadow-md p-6">
                    {member.profilePic ? (
                      <img 
                        src={member.profilePic} 
                        alt={member.name}
                        className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                    )}
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-blue-600 font-medium">{member.position}</p>
                    {member.experience && (
                      <p className="text-gray-600 text-sm mt-2">{member.experience}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map and Actions */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16 px-10 rounded-lg text-center mx-4">
            <h2 className="text-3xl font-bold mb-6">Visit Our Branch</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              We're here to serve retired telecommunications professionals in {name} and surrounding areas. 
              Visit us or get in touch for more information about our services and programs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
              >
                📍 View on Map
              </a>
              <a
                href={`tel:${contact.phone}`}
                className="inline-block bg-green-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-700 transition duration-300 shadow-md"
              >
                📞 Call Us
              </a>
              <Link
                to="/branches"
                className="inline-block bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-700 transition duration-300 shadow-md"
              >
                ← Back to Branches
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default BranchTemplate;
