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
  feedbackId: string;
}

type VoteType = 'upvote' | 'downvote';

const DetailedPost: React.FC = () => {
  const { id: feedbackId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [, setUserType] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<VoteType | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string; userType: string } | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  // flag for offensive post


  // fetch current user info
  useEffect(() => {
    axios
      .get('http://localhost:3000/api/me', { withCredentials: true })
      .then(res => setCurrentUser(res.data))
      .catch(() => setCurrentUser(null));
  }, []);

  // load post + comments + role
  useEffect(() => {
    if (!feedbackId) return;
    (async () => {
      try {
        const [meRes, fbRes, cmRes] = await Promise.all([
          axios.get('http://localhost:3000/api/me', { withCredentials: true }),
          axios.get(`http://localhost:3000/api/feedbacks/${feedbackId}`, { withCredentials: true }),
          axios.get(`http://localhost:3000/api/feedbacks/${feedbackId}/comments`, { withCredentials: true }),
        ]);
        setUserType(meRes.data.userType);
        setCurrentUser(meRes.data);
        setFeedback(fbRes.data.feedback);
        setComments(cmRes.data.comments);
      } catch (err) {
        console.error('Error loading detailed post:', err);
      }
    })();
  }, [feedbackId]);

  // moderate post description

  // summarize thread
  useEffect(() => {
    if (!feedback) return;
    setIsLoadingSummary(true);
    axios
      .get<{ summary: string }>(
        `http://localhost:3000/api/feedbacks/${feedback._id}/summary`,
        { withCredentials: true }
      )
      .then(res => setAiSummary(res.data.summary))
      .catch(err => {
        console.error('Failed to fetch AI summary:', err);
        setAiSummary('Unable to load summary at this time.');
      })
      .finally(() => setIsLoadingSummary(false));
  }, [feedback]);

  const handleVote = async (type: VoteType) => {
    if (!feedbackId || userVote) return;
    try {
      await axios.post(
        `http://localhost:3000/api/feedbacks/${feedbackId}/${type}`,
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
      setUserVote(type);
    } catch (err) {
      console.error(`Failed to ${type}:`, err);
    }
  };

  if (!feedback) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-blue-100 to-gray-100 py-12 px-10">
      <div className="w-full mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate(`/forums/${feedback.communityId}`)}
              className="flex items-center text-white hover:text-gray-200"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="mr-2" /> Back
            </button>
            {currentUser && (
              <p className="text-white text-sm">
                Logged in as <strong>{currentUser.name}</strong>
              </p>
            )}
            {(currentUser?.userType === 'Student' || currentUser?.userType === 'Admin') && (
              <button
                onClick={() => navigate(`/add-comment/${feedback._id}`)}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <FontAwesomeIcon icon={faCommentDots} />
                <span>Add Comment</span>
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-4">{feedback.title}</h1>
          <p className="text-gray-500 text-sm mb-2">
            by <span className="font-medium text-gray-800">{feedback.studentName}</span> ({feedback.standing}, {feedback.major})
          </p>
          <small className="text-gray-400 text-xs block mb-6">
            Posted on {new Date(feedback.createdAt).toLocaleString()}
          </small>
          <p className="text-gray-700 leading-relaxed mb-8">{feedback.description}</p>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">AI Summary</h2>
            {isLoadingSummary ? (
              <p className="text-gray-500">Generating summary…</p>
            ) : (
              <p className="text-gray-700">{aiSummary}</p>
            )}
          </div>

          {/* Voting Controls */}
          <div className="flex items-center space-x-6 mb-8">
            <button
              onClick={() => handleVote('upvote')}
              disabled={Boolean(userVote)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg focus:outline-none transition-colors ${
                userVote === 'upvote' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              } ${userVote ? 'cursor-not-allowed opacity-60' : 'hover:bg-blue-200'}`}
            >
              <FontAwesomeIcon icon={faThumbsUp} />
              <span>{feedback.upvotes}</span>
            </button>

            <button
              onClick={() => handleVote('downvote')}
              disabled={Boolean(userVote)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg focus:outline-none transition-colors ${
                userVote === 'downvote' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              } ${userVote ? 'cursor-not-allowed opacity-60' : 'hover:bg-red-200'}`}
            >
              <FontAwesomeIcon icon={faThumbsDown} />
              <span>{feedback.downvotes}</span>
            </button>
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Comments</h3>
            {comments.length === 0 ? (
              <p className="text-gray-500">No comments yet.</p>
            ) : (
              comments.map(c => (
                <div key={c._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <p className="text-gray-800">
                    <span className="font-medium"><strong>{c.commenterName}</strong></span> says:
                  </p>
                  <p className="text-gray-700 mb-2">{c.commentText}</p>
                  <small className="text-gray-400 text-xs">{new Date(c.createdAt).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedPost;
