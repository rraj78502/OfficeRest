import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import rest from "../assets/rest.jpg";
import BranchTemplate from "./branches/BranchTemplate";

function BranchDetail() {
  const { branchName } = useParams();
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/v1/branches/slug/${branchName}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Branch not found');
          } else {
            setError('Failed to load branch information');
          }
          return;
        }
        
        const data = await response.json();
        setBranch(data.data);
      } catch (err) {
        setError('Network error while loading branch information');
        console.error('Error fetching branch:', err);
      } finally {
        setLoading(false);
      }
    };

    if (branchName) {
      fetchBranch();
    }
  }, [branchName]);

  if (loading) {
    return (
      <div className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading branch information...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-red-800 mb-4">Branch Not Available</h1>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="space-x-4">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <Link
                to="/branches"
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors inline-block"
              >
                Back to Branches
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="px-6 py-16 text-center">
        <h1 className="text-3xl font-bold">Branch Not Found</h1>
        <p className="mt-4">The requested branch does not exist.</p>
        <Link
          to="/branches"
          className="mt-6 inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Back to Branches
        </Link>
      </div>
    );
  }

  // Prepare the branch data in the format expected by BranchTemplate
  const branchData = {
    name: branch.name,
    slug: branch.slug,
    address: branch.address,
    mapLink: branch.mapLink,
    description: branch.description,
    contact: branch.contact,
    workingHours: branch.workingHours,
    services: branch.services || [],
    uniquePrograms: branch.uniquePrograms || [],
    teamMembers: branch.teamMembers || [],
    heroImage: branch.heroImage || rest
  };

  return <BranchTemplate branchData={branchData} />;
}

export default BranchDetail;
