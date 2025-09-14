
import { useState, useEffect } from "react";
import { FaLightbulb, FaBullseye, FaAward } from "react-icons/fa";
import axios from "axios";
import rest1 from '../assets/rest.jpg';
import rest2 from '../assets/rest.jpeg';

const api_base_url = import.meta.env.VITE_API_URL;

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Carousel state
  const [carouselImages, setCarouselImages] = useState([rest1, rest2]); // Default fallback images
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [carouselLoading, setCarouselLoading] = useState(true);

  // Fetch carousel images
  useEffect(() => {
    const fetchCarouselImages = async () => {
      try {
        setCarouselLoading(true);
        const response = await axios.get(
          `${api_base_url}/api/v1/carousel/get-all-carousels?type=home`,
          { withCredentials: true }
        );
        
        if (response.data.success && response.data.data.length > 0) {
          // Get all images from all active home carousels
          const allImages = response.data.data
            .filter(carousel => carousel.isActive)
            .flatMap(carousel => carousel.images.map(img => img.url));
          
          if (allImages.length > 0) {
            setCarouselImages(allImages);
          }
        }
      } catch (err) {
        console.error("Error fetching carousel images:", err);
        // Keep default fallback images
      } finally {
        setCarouselLoading(false);
      }
    };

    fetchCarouselImages();
  }, []);

  // Start slideshow after 5s, then cycle every few seconds
  useEffect(() => {
    if (carouselImages.length <= 1) return; // No slideshow if only one photo

    const startTimer = setTimeout(() => {
      setCurrentPhoto((c) => (c + 1) % carouselImages.length);
      const cycle = setInterval(() => {
        setCurrentPhoto((c) => (c + 1) % carouselImages.length);
      }, 4000); // cycle every 4 seconds
      // Store cycle on window for cleanup within this closure
      window.__rest_cycle = cycle;
    }, 5000); // wait 5 seconds before first transition

    return () => {
      clearTimeout(startTimer);
      if (window.__rest_cycle) {
        clearInterval(window.__rest_cycle);
        delete window.__rest_cycle;
      }
    };
  }, [carouselImages.length]);

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${api_base_url}/api/v1/event/get-all-event`,
          { withCredentials: true }
        );
        if (response.data.success) {
          const upcomingEvents = response.data.data.filter((event) => {
            const eventDate = new Date(event.date);
            const today = new Date();
            return eventDate >= today;
          });
          setEvents(upcomingEvents);
          setError(null);
        } else {
          setError("Failed to fetch events");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <>
      {/* Group Photo Slideshow (beneath header) */}
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
                  alt="Group photograph"
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

      {/* About Section */}
      <section className="text-center py-16 px-6">
        <h2 className="text-3xl font-semibold mb-6">About Our Community</h2>
        <p className="max-w-3xl mx-auto leading-relaxed">
          R.E.S.T is a vibrant community dedicated to supporting retired
          telecommunications professionals. We provide a platform for continued
          connection, shared experiences, and mutual support among our members.
          Our organization has been serving the telecommunications community for
          years, fostering relationships and creating opportunities for
          meaningful engagement in retirement.
        </p>
        <a
          href="/aboutus"
          className="mt-6 inline-block bg-black text-white px-5 py-2 rounded hover:bg-gray-800 transition"
        >
          Learn More About Us →
        </a>
      </section>

      {/* Vision, Mission, Value */}
      <section className="py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Vision, Mission and Value
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: <FaLightbulb size={36} className="text-yellow-400 mb-4" />,
              title: "Vision",
              text: `To create a supportive platform where retired telecommunications professionals can thrive, share their expertise, and contribute to national development and social welfare.`,
            },
            {
              icon: <FaBullseye size={36} className="text-blue-400 mb-4" />,
              title: "Mission",
              text: `To safeguard the welfare of retired employees through income-generating programs, skill enhancement, advocacy for rights, and facilitation of their involvement in telecom-related initiatives and disaster response.`,
            },
            {
              icon: <FaAward size={36} className="text-green-400 mb-4" />,
              title: "Value",
              text: `We value respect, integrity, community support, and the wisdom of experience. Our commitment includes honoring contributions, promoting entitlements, and collaborating with similar organizations for consumer rights and sector coordination.`,
            },
          ].map(({ icon, title, text }) => (
            <div
              key={title}
              className="border border-gray-700 p-6 rounded-lg text-center"
            >
              {icon}
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-sm">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-10">Upcoming Events</h2>
        {loading && (
          <div className="text-center py-10">
            <p>Loading events...</p>
          </div>
        )}
        {error && (
          <div className="text-center py-10 text-red-600">
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && (
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            {events.length > 0 ? (
              events.map((event) => (
                <div
                  key={event._id}
                  className="border border-gray-700 rounded-lg p-6"
                >
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-sm italic mb-2">{event.date}</p>
                  <p className="text-sm">{event.description}</p>
                  {event.files.length > 0 &&
                    event.files[0].type.startsWith("image/") && (
                      <img
                        src={event.files[0].url}
                        alt={event.title}
                        className="mt-4 w-full h-32 object-cover rounded"
                      />
                    )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 col-span-2">
                No upcoming events found.
              </p>
            )}
          </div>
        )}
      </section>
    </>
  );
}

export default Home;
