import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddCommunityPage: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post(
        'http://localhost:3000/api/communities',
        { name, description },
        { withCredentials: true }
      );
      // On success, redirect back to communities list
      navigate('/communities');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add community');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Add a New Community</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="community-name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="community-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Community Name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="community-description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="community-description"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the community"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Community
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCommunityPage;
