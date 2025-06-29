import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

// Models
interface Community { _id: string; name: string; description: string; createdAt: string; }
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
type SentimentMap = Record<string, string>;
type VoteMap = Record<string, VoteType>;

const ForumsPage: React.FC = () => {
  const { id: communityId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [userType, setUserType] = useState<string | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [userVotes, setUserVotes] = useState<VoteMap>(() => {
    try { return JSON.parse(sessionStorage.getItem('userVotes') || '{}'); } catch { return {}; }
  });
  const [sentiments, setSentiments] = useState<SentimentMap>({});

  // Fetch role, community, feedbacks
  useEffect(() => {
    if (!communityId) return;
    (async () => {
      try {
        const [roleRes, commRes, fbRes] = await Promise.all([
          axios.get(`${API_BASE}/api/check-user-role`, { withCredentials: true }),
          axios.get(`${API_BASE}/api/communities/${communityId}`, { withCredentials: true }),
          axios.get(`${API_BASE}/api/communities/${communityId}/feedbacks`, { withCredentials: true }),
        ]);
        setUserType(roleRes.data.userType);
        setCommunity(commRes.data.community);
        setFeedbacks(fbRes.data.feedbacks);
        setSentiments({});
      } catch (e) {
        console.error('Error loading data:', e);
      }
    })();
  }, [communityId, location]);

  // Sentiment analysis
  useEffect(() => {
    feedbacks.forEach(f => {
      if (!sentiments[f._id]) {
        axios.post(
          `${API_BASE}/api/sentiment`,
          { text: f.description },
          { withCredentials: true }
        )
        .then(res => setSentiments(prev => ({ ...prev, [f._id]: res.data.sentiment })))
        .catch(() => setSentiments(prev => ({ ...prev, [f._id]: 'Constructive' })));
      }
    });
  }, [feedbacks, sentiments]);


// 2) whenever you set votes, also persist
  const handleVote = useCallback(async (fid: string, type: VoteType) => {
    if (userVotes[fid]) return;
    try {
      await axios.post(
        `${API_BASE}/api/feedbacks/${fid}/${type}`,
        {},
        { withCredentials: true }
      );
      setFeedbacks(prev =>
        prev.map(fb =>
          fb._id === fid
            ? {
                ...fb,
                upvotes: type === 'upvote' ? fb.upvotes + 1 : fb.upvotes,
                downvotes: type === 'downvote' ? fb.downvotes + 1 : fb.downvotes,
              }
            : fb
        )
      );

      const updated = { ...userVotes, [fid]: type };
      setUserVotes(updated);
      sessionStorage.setItem('userVotes', JSON.stringify(updated));
    } catch (e) {
      console.error('Vote error:', e);
    }
  }, [userVotes]);

  // 3) clear votes on user change
  useEffect(() => {
    sessionStorage.removeItem('userVotes');
    setUserVotes({});
  }, [userType]);

  // Star toggle for admins
  const toggleStar = useCallback(async (fid: string, starred: boolean) => {
    if (userType !== 'Admin') return;
    const action = starred ? 'unstar' : 'star';
    try {
      await axios.post(`${API_BASE}/api/feedbacks/${fid}/${action}`, {}, { withCredentials: true });
      setFeedbacks(prev => prev.map(f => f._id === fid ? { ...f, starred: !f.starred } : f));
    } catch (e) {
      console.error('Star toggle error:', e);
    }
  }, [userType]);

    const handleDelete = useCallback(async (fid: string) => {
    try {
      await axios.delete(
        `${API_BASE}/api/feedbacks/${fid}`,
        { withCredentials: true }
      );
      // remove it from the list
      setFeedbacks(prev => prev.filter(fb => fb._id !== fid));
    } catch (err) {
      console.error('Delete feedback error:', err);
    }
  }, []);

  const getSentimentLabel = useCallback((raw?: string) => {
    const norm = raw?.toLowerCase().trim() || '';
    if (norm.startsWith('positive')) return 'Positive';
    if (norm.startsWith('negative')) return 'Negative';
    return 'Constructive';
  }, []);

  // Memoized list rendering
  const feedbackList = useMemo(() => feedbacks.map(f => (
    <div key={f._id} className="w-full relative bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl p-6 flex flex-col">
      <div onClick={() => navigate(`/feedback/${f._id}`)} className="cursor-pointer flex-grow">
        <h2 className="text-2xl font-semibold mb-2">{f.title}</h2>
        <p className="text-gray-500 text-sm mb-4">by {f.studentName} ({f.standing}, {f.major})</p>
        <p className="text-gray-600 mb-4">{f.description}</p>
        <h3 className="font-medium">Sentiment: <span className={
          getSentimentLabel(sentiments[f._id]) === 'Positive' ? 'text-green-600'
          : getSentimentLabel(sentiments[f._id]) === 'Negative' ? 'text-red-600'
          : 'text-yellow-600'
        }>{getSentimentLabel(sentiments[f._id])}</span></h3>
        <small className="text-gray-400 text-xs">Posted on {new Date(f.createdAt).toLocaleDateString()}</small>
      </div>
      <div className="flex items-center mt-4 space-x-6">
        <button onClick={e => { e.stopPropagation(); handleVote(f._id, 'upvote'); }} disabled={!!userVotes[f._id]} className={`flex items-center space-x-1 focus:outline-none ${userVotes[f._id] === 'upvote' ? 'text-blue-600' : 'text-gray-600'} ${userVotes[f._id] ? 'opacity-60 cursor-not-allowed' : ''}`}>          
          <FontAwesomeIcon icon={faThumbsUp} /><span>{f.upvotes}</span>
        </button>
        <button onClick={e => { e.stopPropagation(); handleVote(f._id, 'downvote'); }} disabled={!!userVotes[f._id]} className={`flex items-center space-x-1 focus:outline-none ${userVotes[f._id] === 'downvote' ? 'text-red-600' : 'text-gray-600'} ${userVotes[f._id] ? 'opacity-60 cursor-not-allowed' : ''}`}>          
          <FontAwesomeIcon icon={faThumbsDown} /><span>{f.downvotes}</span>
        </button>
      </div>
      {userType === 'Admin' && (
        <>
          <button onClick={e => { e.stopPropagation(); toggleStar(f._id, f.starred); }} className="absolute top-3 right-10 text-xl focus:outline-none">
            <FontAwesomeIcon icon={f.starred ? faSolidStar : faRegularStar} className={f.starred ? 'text-yellow-400' : 'text-gray-300'} />
          </button>
          <button onClick={e => { e.stopPropagation(); handleDelete(f._id); }} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 focus:outline-none">
            <FontAwesomeIcon icon={faTrash} className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  )), [feedbacks, sentiments, userVotes, userType, handleVote, toggleStar, getSentimentLabel, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-blue-100 to-gray-100">
      <header className="py-10 text-center bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md">
        <h1 className="text-4xl font-extrabold tracking-wide">{community ? `${community.name} Forum` : 'Loading...'}</h1>
        {userType === 'Student' && (
          <button onClick={() => navigate(`/add-forum/${communityId}`)} className="mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
            Add Feedback
          </button>
        )}
      </header>
      <main className="py-16 px-5 w-full max-w-5xl mx-auto space-y-8">
        {feedbacks.length === 0 ? (
          <p className="text-center text-gray-500">No feedback yet.</p>
        ) : (
          feedbackList
        )}
      </main>
    </div>
  );
};

export default ForumsPage;
