import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faThumbsUp,
  faThumbsDown,
  faStar as faSolidStar,
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';
import { API_BASE } from './api';

// Data models
interface Community {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
}
interface Feedback {
  _id: string;
  studentName: string;
  standing: string;
  major: string;
  title: string;
  description: string;
  upvotes: number;
  downvotes: number;
  starred: boolean;
  createdAt: string;
  communityId: string;
}

type VoteType = 'upvote' | 'downvote';

const ForumsPage: React.FC = () => {
  const { id: communityId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [userType, setUserType] = useState<string | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, VoteType>>({});

  // New state for sentiment analysis
  const [sentiments, setSentiments] = useState<Record<string, string>>({});

  // load persisted vote choices from this session
  useEffect(() => {
    const stored = sessionStorage.getItem('userVotes');
    if (stored) {
      try {
        setUserVotes(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // fetch role, community, and feedbacks
  useEffect(() => {
    async function fetchData() {
      if (!communityId) return;
      try {
        const [roleRes, commRes, fbRes] = await Promise.all([
          axios.get(`${API_BASE}/api/check-user-role`, { withCredentials: true }),
          axios.get(`${API_BASE}/api/communities/${communityId}`, { withCredentials: true }),
          axios.get(`${API_BASE}/api/communities/${communityId}/feedbacks`, { withCredentials: true }),
        ]);
        setUserType(roleRes.data.userType);
        setCommunity(commRes.data.community);
        setFeedbacks(fbRes.data.feedbacks);
        // reset sentiments when community changes
        setSentiments({});
      } catch (err) {
        console.error('Error loading data:', err);
      }
    }
    fetchData();
  }, [communityId, location]);

  // sentiment analysis for each feedback
  useEffect(() => {
    if (feedbacks.length === 0) return;
    feedbacks.forEach(f => {
      if (sentiments[f._id]) return;
      axios
        .post(
          `${API_BASE}/api/sentiment`,
          { text: f.description },
          { withCredentials: true }
        )
        .then(res => {
          setSentiments(prev => ({ ...prev, [f._id]: res.data.sentiment }));
        })
        .catch(err => {
          console.error('Sentiment API error for', f._id, err);
          setSentiments(prev => ({ ...prev, [f._id]: 'Constructive' }));
        });
    });
  }, [feedbacks, sentiments]);

  // up/downvote handler
  const handleVote = async (fid: string, type: VoteType) => {
    if (userVotes[fid]) return; // one vote per session
    try {
      await axios.post(
        `${API_BASE}/api/feedbacks/${fid}/${type}`,
        {},
        { withCredentials: true }
      );
      setFeedbacks(prev =>
        prev.map(f =>
          f._id === fid
            ? {
                ...f,
                upvotes: type === 'upvote' ? f.upvotes + 1 : f.upvotes,
                downvotes: type === 'downvote' ? f.downvotes + 1 : f.downvotes,
              }
            : f
        )
      );
      const updatedVotes = { ...userVotes, [fid]: type };
      setUserVotes(updatedVotes);
      sessionStorage.setItem('userVotes', JSON.stringify(updatedVotes));
    } catch (err) {
      console.error('Vote error:', err);
    }
  };  

  // star toggle handler for admins (persistent)
  const toggleStar = async (fid: string, currentlyStarred: boolean) => {
    if (userType !== 'Admin') return;
    const action = currentlyStarred ? 'unstar' : 'star';
    try {
      await axios.post(
        `${API_BASE}/api/feedbacks/${fid}/${action}`,
        {},
        { withCredentials: true }
      );
      setFeedbacks(prev =>
        prev.map(f =>
          f._id === fid
            ? { ...f, starred: !f.starred }
            : f
        )
      );
    } catch (err) {
      console.error('Star toggle error:', err);
    }
  };

  
    const getSentimentLabel = (raw: string | undefined) => {
      if (!raw) return '…';
      const norm = raw.trim().toLowerCase();
      if (norm.startsWith('positive'))    return 'Positive';
      if (norm.startsWith('negative'))    return 'Negative';
      // catch both “construct” and “constructive”
      if (norm.startsWith('construct'))   return 'Constructive';
      // fallback in case something odd comes back
      return 'Constructive';
    };


  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-blue-100 to-gray-100">
      {/* Header */}
      <header className="py-10 text-center bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md">
        <h1 className="text-4xl font-extrabold tracking-wide">
          {community ? `${community.name} Forum` : 'Loading...'}
        </h1>
        {userType === 'Student' && (
          <button
            onClick={() => navigate(`/add-forum/${communityId}`)}
            className="mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Feedback
          </button>
        )}
      </header>

      {/* Feedback List */}
      <main className="flex flex-col items-center py-16 px-5">
        <div className="w-full max-w-5xl space-y-8">
          {feedbacks.length === 0 && (
            <p className="text-center text-gray-500">No feedback yet.</p>
          )}

          {feedbacks.map(f => (
            <div
              key={f._id}
              className="relative bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col"
            >
              {/* Clickable content area */}
              <div
                onClick={() => navigate(`/feedback/${f._id}`)}
                className="cursor-pointer flex-grow"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">{f.title}</h2>
                <p className="text-gray-500 text-sm mb-4">
                  by {f.studentName} ({f.standing}, {f.major})
                </p>
                <p className="text-gray-600 text-base mb-4">{f.description}</p>
                {/* Sentiment display */}
                <h3 className="mt-2  font-medium">
                  Sentiment:&nbsp;
                  <span
                    className={
                      sentiments[f._id] === 'Positive'
                        ? 'text-green-600'
                        : sentiments[f._id] === 'Negative'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }
                  >
                   {getSentimentLabel(sentiments[f._id])}
                  </span>
                </h3>
                <small className="text-gray-400 text-xs">
                  Posted on {new Date(f.createdAt).toLocaleDateString()}
                </small>
              </div>

              {/* Voting controls */}
              <div className="flex items-center mt-4 space-x-6">
                <button
                  onClick={e => { e.stopPropagation(); handleVote(f._id, 'upvote'); }}
                  disabled={Boolean(userVotes[f._id])}
                  className={`flex items-center space-x-1 focus:outline-none ${
                    userVotes[f._id] === 'upvote' ? 'text-blue-600' : 'text-gray-600'
                  } ${userVotes[f._id] ? 'cursor-not-allowed opacity-60' : ''}`}
                  aria-label="Upvote"
                >
                  <FontAwesomeIcon icon={faThumbsUp} />
                  <span>{f.upvotes}</span>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); handleVote(f._id, 'downvote'); }}
                  disabled={Boolean(userVotes[f._id])}
                  className={`flex items-center space-x-1 focus:outline-none ${
                    userVotes[f._id] === 'downvote' ? 'text-red-600' : 'text-gray-600'
                  } ${userVotes[f._id] ? 'cursor-not-allowed opacity-60' : ''}`}
                  aria-label="Downvote"
                >
                  <FontAwesomeIcon icon={faThumbsDown} />
                  <span>{f.downvotes}</span>
                </button>
              </div>

              {/* Admin-only star & delete */}
              {userType === 'Admin' && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); toggleStar(f._id, f.starred); }}
                    className="absolute top-3 right-10 text-xl focus:outline-none"
                    aria-label="Star post"
                  >
                    <FontAwesomeIcon
                      icon={f.starred ? faSolidStar : faRegularStar}
                      className={f.starred ? 'text-yellow-400' : 'text-gray-300'}
                    />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); /* your delete logic */ }}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-600 focus:outline-none"
                    aria-label="Delete feedback"
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ForumsPage;

