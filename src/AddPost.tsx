import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const AddFeedbackPage: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();

  // We'll fetch the logged‐in user's name instead of asking for it
  const [userName, setUserName] = useState<string>('');
  const [standing, setStanding] = useState('');
  const [major, setMajor] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // On mount, fetch the current user's name
  useEffect(() => {
    axios
      .get('http://localhost:3000/api/me', { withCredentials: true })
      .then(res => setUserName(res.data.name))
      .catch(() => setError('Could not fetch your user info. Please log in again.'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!communityId) {
      setError('Invalid community.');
      return;
    }
    if (!userName) {
      setError('User not recognized. Please log in.');
      return;
    }
  

    try {
      await axios.post(
        `http://localhost:3000/api/communities/${communityId}/feedbacks`,
        {
          studentName: userName, // use logged‐in name
          standing,
          major,
          title,
          description,
        },
        { withCredentials: true }
      );
      navigate(`/forums/${communityId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Add Feedback</h2>

        {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Show the fetched user name */}
          <div>
            <p className="text-gray-700">
              <span className="font-medium">Your Name:</span> {userName || 'Loading...'}
            </p>
          </div>

          <div>
            <label htmlFor="standing" className="block text-sm font-medium text-gray-700">
              Standing
            </label>
            <input
              id="standing"
              type="text"
              required
              value={standing}
              onChange={e => setStanding(e.target.value)}
              placeholder="e.g. Sophomore"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="major" className="block text-sm font-medium text-gray-700">
              Major
            </label>
            <input
              id="major"
              type="text"
              required
              value={major}
              onChange={e => setMajor(e.target.value)}
              placeholder="e.g. Computer Science"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Feedback Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Short, descriptive title"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Your detailed feedback..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFeedbackPage;
