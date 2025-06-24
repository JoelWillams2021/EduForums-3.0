import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import community from './assets/community.svg';
import { API_BASE } from './api';

type Community = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
};

const CommunitiesPage: React.FC = () => {
  const [userType, setUserType] = useState<string | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      try {
        const [roleRes, listRes] = await Promise.all([
          axios.get(`${API_BASE}/api/check-user-role`, { withCredentials: true }),
          axios.get(`${API_BASE}/api/communities`, { withCredentials: true }),
        ]);
        setUserType(roleRes.data.userType);
        setCommunities(listRes.data.communities);
      } catch (err) {
        console.error('Error loading data:', err);
        setUserType(null);
        setCommunities([]);
      }
    }
    init();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/api/communities/${id}`, { withCredentials: true });
      setCommunities((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-blue-100 to-gray-100">
      {/* Header */}
      <header className="py-10 text-center bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md">
        <h1 className="text-5xl font-extrabold tracking-wide">Communities</h1>
        {userType === 'Admin' && (
          <div className="mt-8">
            <button
              onClick={() => navigate('/add-community')}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Community
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center py-16 px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
          {communities.length === 0 && (
            <p className="col-span-full text-center text-gray-500">No communities yet.</p>
          )}

          {communities.map((c) => (
            <div
              key={c._id}
              onClick={() => navigate(`/forums/${c._id}`)}
              className="cursor-pointer relative bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col"
            >
              {/* Delete Icon Button */}
              {userType === 'Admin' && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(c._id); }}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-600 focus:outline-none"
                  aria-label="Delete community"
                >
                  <FontAwesomeIcon icon={faTrash} className="h-6 w-6" />
                </button>
              )}

              <img src={community} alt={c.name} className="h-48 w-auto mx-auto mb-4" />

              <h2 className="text-2xl font-semibold text-gray-800 mb-2">{c.name}</h2>
              <p className="text-gray-600 text-base mb-4">{c.description}</p>
              <small className="text-gray-400 text-xs mt-auto">
                Created on {new Date(c.createdAt).toLocaleDateString()}
              </small>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CommunitiesPage;
