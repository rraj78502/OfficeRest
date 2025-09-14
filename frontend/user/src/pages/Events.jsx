import { useState, useEffect } from "react";
  import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";
  import { useNavigate } from "react-router-dom";
  import axios from "axios";

  const api_base_url = import.meta.env.VITE_API_URL;

  function Events() {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [modalImage, setModalImage] = useState(null);
    const navigate = useNavigate();

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
            setEvents(response.data.data);
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

    // Fetch single event by ID
    const fetchEventById = async (id) => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${api_base_url}/api/v1/event/get-event/${id}`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setSelectedEvent(response.data.data);
        } else {
          setError("Failed to fetch event");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching event");
      } finally {
        setLoading(false);
      }
    };

    // Handle Register Now button click
    const handleRegister = async () => {
      try {
        const response = await axios.get(
          `${api_base_url}/api/v1/user/check-auth`,
          { withCredentials: true }
        );
        if (response.data.success && (response.data.data.role === "user" || response.data.data.role === "admin")) {
          setNotification({
            message: "Registered successfully!",
            type: "success",
          });
          setTimeout(() => setNotification(null), 3000);
        } else {
          navigate("/login");
        }
      } catch {
        navigate("/login");
      }
    };

    // Filter upcoming events (future dates)
    const upcomingEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      const today = new Date();
      return eventDate >= today;
    });

    // Filter recent events (past dates)
    const recentEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      const today = new Date();
      return eventDate < today;
    });

    return (
      <div className="bg-gray-50 text-gray-800">
        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${
              notification.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            <p>{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="absolute top-1 right-2 text-white hover:text-gray-200"
            >
              &times;
            </button>
          </div>
        )}

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#0c1c35] to-[#13284c] text-white py-20 text-center">
          <h1 className="text-4xl font-bold mb-2">Events & Activities</h1>
          <p className="text-lg">
            Stay connected with our community through regular events and activities
          </p>
        </section>

        {/* Loading and Error States */}
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

        {/* Selected Event Details */}
        {selectedEvent && !loading && !error && (
          <section className="py-20 px-6 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">{selectedEvent.title}</h2>
            <p className="text-sm text-gray-600 mb-4">{selectedEvent.description}</p>
            <ul className="text-sm space-y-2 text-gray-800 mb-6">
              <li className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-600" />
                {selectedEvent.date}
              </li>
              <li className="flex items-center gap-2">
                <FaClock className="text-gray-600" />
                {selectedEvent.time}
              </li>
              <li className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-600" />
                {selectedEvent.location}
              </li>
            </ul>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
              {selectedEvent.files
                .filter((file) => file.type.startsWith("image/"))
                .map((file, idx) => (
                  <img
                    key={idx}
                    src={file.url}
                    alt={`${selectedEvent.title} - Image ${idx + 1}`}
                    className="w-full h-48 object-cover rounded cursor-pointer"
                    onClick={() => setModalImage(file.url)}
                  />
                ))}
              {selectedEvent.files
                .filter((file) => file.type === "application/pdf")
                .map((file, idx) => (
                  <a
                    key={idx}
                    href={file.url}
                    download
                    className="block w-full h-48 flex items-center justify-center bg-gray-100 rounded border border-gray-300 hover:bg-gray-200 transition"
                    style={{ textDecoration: 'none' }}
                  >
                    <span className="text-lg font-semibold text-gray-700">Download PDF {idx + 1}</span>
                  </a>
                ))}
            </div>
            {/* Modal for full-size image */}
            {modalImage && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setModalImage(null)}>
                <img src={modalImage} alt="Full Size" className="max-w-full max-h-full rounded shadow-lg" />
              </div>
            )}
            <button
              onClick={() => setSelectedEvent(null)}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition font-semibold"
            >
              Back to Events
            </button>
          </section>
        )}

        {/* Upcoming Events Section */}
        {!selectedEvent && !loading && !error && (
          <section className="py-20 px-6 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Upcoming Events</h2>
            {upcomingEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingEvents.map((event) => (
                  <div
                    key={event._id}
                    className="bg-white rounded-lg shadow p-6 flex flex-col justify-between cursor-pointer"
                    onClick={() => fetchEventById(event._id)}
                  >
                    <div>
                      <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                      <ul className="text-sm space-y-2 text-gray-800">
                        <li className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-600" />
                          {event.date}
                        </li>
                        <li className="flex items-center gap-2">
                          <FaClock className="text-gray-600" />
                          {event.time}
                        </li>
                        <li className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-gray-600" />
                          {event.location}
                        </li>
                      </ul>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegister(event._id);
                      }}
                      className="mt-6 bg-black text-white text-sm font-semibold py-2 rounded hover:bg-gray-800 transition"
                    >
                      Register Now
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">No upcoming events found.</p>
            )}
          </section>
        )}

        {/* Current Discussions Section
        {!selectedEvent && !loading && !error && (
          <section className="py-20 px-6 bg-white text-gray-800">
            <h2 className="text-3xl font-bold text-center mb-12">Current Discussions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {[
                {
                  title: "Healthcare Benefits Discussion",
                  desc: "Discussion regarding enhanced healthcare benefits for retired members. We are exploring partnerships with local hospitals for better medical care coverage.",
                  status: "Ongoing",
                },
                {
                  title: "Pension Fund Updates",
                  desc: "Updates on pension fund management and distribution policies. Members will be informed about recent changes and future planning.",
                  status: "Under Review",
                },
                {
                  title: "Community Center Renovation",
                  desc: "Plans for renovating our community center to make it more accessible and comfortable for all members, especially elderly participants.",
                  status: "Planning Phase",
                },
                {
                  title: "Digital Literacy Program",
                  desc: "Initiative to help members become more comfortable with digital technology and online communication platforms.",
                  status: "Proposed",
                },
              ].map(({ title, desc, status }, idx) => (
                <div
                  key={idx}
                  className="bg-white border rounded-lg p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{title}</h3>
                    <p className="text-sm text-gray-700 mb-4">{desc}</p>
                    <p className="font-semibold text-sm">
                      Status: <span className="font-normal">{status}</span>
                    </p>
                  </div>
                  <button className="mt-6 border border-black text-black px-4 py-2 rounded hover:bg-gray-100 text-sm font-semibold transition">
                    Learn More
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-16 text-center">
              <p className="mb-4 text-gray-700">Have suggestions or concerns? We value your input!</p>
              <button className="bg-black text-white px-5 py-2 rounded hover:bg-gray-800 text-sm font-semibold">
                Submit Feedback
              </button>
            </div>
          </section>
        )} */}

        {/* Recent Events Section */}
        {!selectedEvent && !loading && !error && (
          <section className="bg-gray-50 px-6 py-20 text-gray-800">
            <div className="max-w-7xl mx-auto flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold">Recent Events</h2>
              <button className="border border-black text-black px-4 py-2 rounded hover:bg-gray-100 text-sm font-semibold transition">
                View All Events
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {recentEvents.length > 0 ? (
                recentEvents.map((event) => (
                  <div
                    key={event._id}
                    className="bg-white p-6 rounded-lg border shadow-sm flex flex-col justify-between cursor-pointer"
                    onClick={() => fetchEventById(event._id)}
                  >
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                      <p className="text-sm text-gray-700 mb-4">{event.description}</p>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{event.date}</span>
                      <span>{event.files.length} media files</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 col-span-full">No recent events found.</p>
              )}
            </div>
          </section>
        )}

        {/* Stay Connected Banner */}
        <section className="bg-black text-white text-center py-20 px-6">
          <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Don’t miss out on any of our events and activities. Join our community
            and stay informed about all upcoming programs.
          </p>
          <button className="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-100 transition">
            Join Our Newsletter
          </button>
        </section>
      </div>
    );
  }

  export default Events;
