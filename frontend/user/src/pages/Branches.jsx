import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/v1/branches');
        
        if (!response.ok) {
          throw new Error('Failed to fetch branches');
        }
        
        const data = await response.json();
        setBranches(data.data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching branches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);
  if (loading) {
    return (
      <div className="bg-gray-50 px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-10">Our Branches</h1>
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading branches...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-10">Our Branches</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-red-800 mb-4">Unable to Load Branches</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="bg-gray-50 px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-10">Our Branches</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-yellow-800 mb-4">No Branches Available</h2>
            <p className="text-yellow-600">We're currently setting up our branch network. Please check back soon!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 px-6 py-16">
      <h1 className="text-2xl font-bold text-center mb-10">Our Branches</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {branches.map((branch) => (
          <div key={branch._id} className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
            <div>
              <Link to={`/branch/${branch.slug}`}>
                <h3 className="font-bold text-xl text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 mb-2">
                  {branch.name} Branch
                </h3>
              </Link>
              <p className="text-sm text-gray-600 mb-3">{branch.address}</p>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                {branch.description.length > 150 
                  ? `${branch.description.substring(0, 150)}...` 
                  : branch.description
                }
              </p>
              <div className="flex gap-2 mb-4">
                <a
                  href={branch.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm hover:text-blue-800 hover:underline transition-colors duration-200"
                >
                  📍 View on Map
                </a>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/branch/${branch.slug}`}
                className="flex-1 bg-[#0c1c35] text-white py-2 px-4 rounded hover:bg-[#13284c] text-center transition-colors duration-200 font-medium"
              >
                Learn More
              </Link>
              <a
                href={branch.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 text-center transition-colors duration-200 font-medium"
              >
                Directions
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Branches;
