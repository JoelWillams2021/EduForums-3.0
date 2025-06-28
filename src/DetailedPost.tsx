import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faThumbsUp,
  faThumbsDown,
  faCommentDots,
} from '@fortawesome/free-solid-svg-icons';
import { API_BASE } from './api';

// Types for feedback and comments
interface Feedback {
  _id: string;
  studentName: string;
  standing: string;
  major: string;
  title: string;
  description: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  communityId: string;
}
interface Comment {
  _id: string;
  commenterName: string;
  commentText: string;
  createdAt: string;
}

type VoteType = 'upvote' | 'downvote';

const DetailedPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Combined state
  const [user, setUser] = useState<{ name: string; userType: string } | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [vote, setVote] = useState<VoteType | null>(null);

  // Fetch user, feedback, comments, and summary in one effect
  useEffect(() => {
    if (!id) return;
    axios
      .all([
        axios.get(`${API_BASE}/api/me`, { withCredentials: true }),
        axios.get(`${API_BASE}/api/feedbacks/${id}`, { withCredentials: true }),
        axios.get(`${API_BASE}/api/feedbacks/${id}/comments`, { withCredentials: true }),
        axios.get(`${API_BASE}/api/feedbacks/${id}/summary`, { withCredentials: true }),
      ])
      .then(
        axios.spread((meRes, fbRes, cmRes, sumRes) => {
          setUser(meRes.data);
          setFeedback(fbRes.data.feedback);
          setComments(cmRes.data.comments);
          setSummary(sumRes.data.summary);
        })
      )
      .catch(console.error);
  }, [id]);

  // Voting handler
  const handleVote = async (type: VoteType) => {
    if (!id || vote) return;
    try {
      await axios.post(
        `${API_BASE}/api/feedbacks/${id}/${type}`,
        {},
        { withCredentials: true }
      );
      setFeedback(prev =>
        prev
          ? {
              ...prev,
              upvotes: type === 'upvote' ? prev.upvotes + 1 : prev.upvotes,
              downvotes: type === 'downvote' ? prev.downvotes + 1 : prev.downvotes,
            }
          : null
      );
      setVote(type);
    } catch {
      console.error(`Failed to ${type}`);
    }
  };

  // Loading state
  if (!feedback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-blue-100 to-gray-100 py-12 px-10">
      <div className="w-full mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 flex justify-between items-center">
          <button
            onClick={() => navigate(`/forums/${feedback.communityId}`)}
            className="text-white hover:text-gray-200 flex items-center"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="mr-2" /> Back
          </button>
          {user && <span className="text-white">Logged in as {user.name}</span>}
          {user && (
            <button
              onClick={() => navigate(`/add-comment/${feedback._id}`)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <FontAwesomeIcon icon={faCommentDots} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-8">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
            {feedback.title}
          </h1>
          <p className="text-gray-500 text-sm mb-2">
            by <strong>{feedback.studentName}</strong> ({feedback.standing}, {feedback.major})
          </p>
          <small className="text-gray-400 text-xs block mb-6">
            Posted on {new Date(feedback.createdAt).toLocaleString()}
          </small>
          <p className="text-gray-700 leading-relaxed mb-8">
            {feedback.description}
          </p>

          {/* AI Summary */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Summary
            </h2>
            <p className="text-gray-700">{summary}</p>
          </div>

          {/* Voting Controls */}
          <div className="flex space-x-6 mb-8">
            <button
              onClick={() => handleVote('upvote')}
              disabled={!!vote}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                vote === 'upvote' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              } ${vote ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-200'}`}
                          >
                            <FontAwesomeIcon icon={faThumbsUp} />
                            <span>{feedback.upvotes}</span>
                          </button>
                          <button
                            onClick={() => handleVote('downvote')}
                            disabled={!!vote}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                vote === 'downvote' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              } ${vote ? 'opacity-60 cursor-not-allowed' : 'hover:bg-red-200'}`}
            >
              <FontAwesomeIcon icon={faThumbsDown} />
              <span>{feedback.downvotes}</span>
            </button>
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Comments
            </h3>
            {!comments.length && <p className="text-gray-500">No comments yet.</p>}
            {comments.map(c => (
              <div key={c._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-gray-800">
                  <strong>{c.commenterName}</strong> says:
                </p>
                <p className="text-gray-700 mb-2">{c.commentText}</p>
                <small className="text-gray-400 text-xs">
                  {new Date(c.createdAt).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedPost;
