import { useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from './api';

const AddComment: React.FC = () => {
  const { feedbackId } = useParams<{ feedbackId: string }>();
  const navigate = useNavigate();
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState<string>('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!feedbackId) return setError('Invalid post.');

      try {
        const commentText = commentRef.current!.value;
        await axios.post(
          `${API_BASE}/feedbacks/${feedbackId}/comments`,
          { commentText },
          { withCredentials: true }
        );
        navigate(`/feedback/${feedbackId}`);
      } catch (err: any) {
        setError(err.response?.data?.error ?? 'Failed to submit comment');
      }
    },
    [feedbackId, navigate]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Add Comment</h2>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="commentText" className="block text-sm font-medium text-gray-700">
              Comment
            </label>
            <textarea
              id="commentText"
              ref={commentRef}
              rows={4}
              required                       // ← built-in browser validation
              placeholder="Write your comment..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Comment
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddComment;
