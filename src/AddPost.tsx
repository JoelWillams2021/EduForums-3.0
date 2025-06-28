import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from './api';

interface FormFields {
  standing: string;
  major: string;
  title: string;
  description: string;
}

const AddFeedbackPage: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();

  const [userName, setUserName] = useState<string>('');
  const [form, setForm] = useState<FormFields>({
    standing: '',
    major: '',
    title: '',
    description: ''
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/me`, { withCredentials: true })
      .then(res => setUserName(res.data.name))
      .catch(() => setError('Could not fetch your user info. Please log in again.'));
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { id, value } = e.target;
      setForm(prev => ({ ...prev, [id]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!communityId) return setError('Invalid community.');
      if (!userName) return setError('User not recognized. Please log in.');

      try {
        await axios.post(
          `${API_BASE}/api/communities/${communityId}/feedbacks`,
          { studentName: userName, ...form },
          { withCredentials: true }
        );
        navigate(`/forums/${communityId}`);
      } catch (err: any) {
        setError(err.response?.data?.error ?? 'Failed to submit feedback');
      }
    },
    [communityId, userName, form, navigate]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Add Feedback</h2>

        {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-gray-700">
              <span className="font-medium">Your Name:</span> {userName || 'Loading...'}
            </p>
          </div>

          {(['standing', 'major', 'title'] as const).map(field => (
            <div key={field}>
              <label htmlFor={field} className="block text-sm font-medium text-gray-700 capitalize">
                {field === 'title' ? 'Feedback Title' : field}
              </label>
              <input
                id={field}
                type="text"
                required
                value={form[field]}
                onChange={handleChange}
                placeholder={
                  field === 'standing'
                    ? 'e.g. Sophomore'
                    : field === 'major'
                    ? 'e.g. Computer Science'
                    : 'Short, descriptive title'
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              required
              value={form.description}
              onChange={handleChange}
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
