import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from './api';

const AddComment: React.FC = () => {
  const { feedbackId } = useParams<{ feedbackId: string }>();
  const [commentText, setCommentText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      if (!commentText.trim()) {
        return setError('Comment cannot be empty.');
      }
      setLoading(true);
      try {
        await axios.post(
          `${API_BASE}/api/feedbacks/${feedbackId}/comments`,
          { commentText },
          { withCredentials: true }
        );
        setSuccess('Comment submitted successfully!');
        setCommentText('');
      } catch (err: any) {
        setError(err.response?.data?.error ?? 'Failed to submit comment');
      } finally {
        setLoading(false);
      }
    },
    [commentText, feedbackId]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Add Comment</h2>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="commentText" className="block text-sm font-medium text-gray-700">
              Comment
            </label>
            <textarea
              id="commentText"
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
              placeholder="Write your comment..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 text-white font-semibold rounded-lg transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Submitting...' : 'Submit Comment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddComment;