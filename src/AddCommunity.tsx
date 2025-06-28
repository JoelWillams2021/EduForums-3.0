import React, { useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from './api';

const AddCommunityPage: React.FC = () => {
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError('');

      const name = nameRef.current?.value.trim() || '';
      const description = descriptionRef.current?.value.trim() || '';
      if (!name || !description) {
        setError('Both fields are required.');
        return;
      }

      try {
        await axios.post(
          `${API_BASE}/api/communities`,
          { name, description },
          { withCredentials: true }
        );
        navigate('/communities');
      } catch (err: any) {
        setError(err.response?.data?.error ?? 'Failed to add community');
      }
    },
    [navigate]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Add a New Community
        </h2>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="community-name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="community-name"
              type="text"
              ref={nameRef}
              required
              placeholder="Community Name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="community-description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="community-description"
              ref={descriptionRef}
              required
              rows={4}
              placeholder="Brief description of the community"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

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
