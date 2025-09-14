import React, { useState, useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import axios from "axios";

const categories = [
  "All Photos",
  "Meetings",
  "Social Events",
  "Cultural Programs",
  "Workshops",
  "Ceremonies",
];

const api_base_url = import.meta.env.VITE_API_URL;

function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All Photos");
  const [photos, setPhotos] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalImage, setModalImage] = useState(null);

  // Fetch all gallery posts
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${api_base_url}/api/v1/gallery/get-all-images`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setPhotos(response.data.data);
          setError(null);
        } else {
          setError("Failed to fetch gallery posts");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching gallery posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  // Fetch single post by ID
  const fetchPostById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${api_base_url}/api/v1/gallery/get-image/${id}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setSelectedPost(response.data.data);
      } else {
        setError("Failed to fetch post");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching post");
    } finally {
      setLoading(false);
    }
  };

  // Filter photos based on active category
  const filteredPhotos =
    activeCategory === "All Photos"
      ? photos
      : photos.filter((p) => p.category === activeCategory);

  return (
    <div className="bg-white text-gray-800">
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0c1c35] to-[#13284c] text-white py-20 text-center">
        <h1 className="text-4xl font-bold">Gallery</h1>
        <p className="mt-2 text-lg">
          Capturing moments of our vibrant community life and activities
        </p>
      </section>

      {/* Filter Buttons */}
      <div className="py-8 px-6 max-w-7xl mx-auto flex flex-wrap gap-3 justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setSelectedPost(null); // Reset selected post when changing category
            }}
            className={`px-4 py-2 rounded border font-semibold text-sm ${
              activeCategory === cat
                ? "bg-black text-white"
                : "bg-white border-black text-black hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-10">
          <p>Loading gallery...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-10 text-red-600">
          <p>{error}</p>
        </div>
      )}

      {/* Selected Post Details */}
      {selectedPost && !loading && !error && (
        <section className="px-6 py-10 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">{selectedPost.title}</h2>
          <div className="flex items-center text-sm text-gray-600 gap-2 mb-2">
            <FaCalendarAlt className="text-gray-500" />
            <span>{selectedPost.date}</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">{selectedPost.category}</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {selectedPost.images.map((image, idx) => (
              <img
                key={idx}
                src={image.url}
                alt={`${selectedPost.title} - Image ${idx + 1}`}
                className="w-full h-48 object-cover rounded cursor-pointer"
                onClick={() => setModalImage(image.url)}
              />
            ))}
          </div>
          <button
            onClick={() => setSelectedPost(null)}
            className="mt-6 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition font-semibold"
          >
            Back to Gallery
          </button>
        </section>
      )}

      {/* Modal for full-size image */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage}
            alt="Full Size"
            className="max-w-full max-h-full rounded shadow-lg"
          />
        </div>
      )}

      {/* Gallery Grid */}
      {!selectedPost && !loading && !error && (
        <section className="px-6 pb-20 max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredPhotos.length > 0 ? (
            filteredPhotos.map((photo) => (
              <div
                key={photo._id}
                className="bg-white border rounded-md shadow-sm overflow-hidden cursor-pointer"
                onClick={() => fetchPostById(photo._id)}
              >
                <img
                  src={photo.images[0]?.url || "https://via.placeholder.com/800"}
                  alt={photo.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-base mb-1">{photo.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 gap-2 mb-1">
                    <FaCalendarAlt className="text-gray-500" />
                    <span>{photo.date}</span>
                  </div>
                  <p className="text-sm text-gray-700">{photo.category}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full">
              No photos found for this category.
            </p>
          )}
        </section>
      )}

      {/* Banner
      <section className="bg-black text-white text-center py-20 px-6">
        <h2 className="text-2xl font-bold mb-4">Share Your Memories</h2>
        <p className="max-w-2xl mx-auto mb-6">
          Do you have photos from our events that you'd like to share? We'd love
          to add them to our gallery!
        </p>
        <button className="bg-white text-black px-5 py-2 rounded hover:bg-gray-100 transition font-semibold">
          Submit Photos
        </button>
      </section> */}
    </div>
  );
}

export default Gallery;
