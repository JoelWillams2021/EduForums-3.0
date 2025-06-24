
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './Landing';
import CommunitiesPage from './Communities';
import AddCommunityPage from './AddCommunity';
import Forums from './Forums';
import AddPost from './AddPost';
import DetailedPost from './DetailedPost';
import AddComment from './AddComment'; 

import {
  SignUpStudentPage,
  LogInStudentPage,
  SignUpAdminPage,
  LogInAdminPage,
} from './AuthForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/student-signup" element={<SignUpStudentPage />} />
        <Route path="/admin-signup" element={<SignUpAdminPage />} />
        <Route path="/login-student" element={<LogInStudentPage />} />
        <Route path="/login-admin" element={<LogInAdminPage />} />
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="/add-community" element={<AddCommunityPage />} />
        <Route path="/forums/:id" element={<Forums />} />
        <Route path="/add-forum/:communityId" element={<AddPost />} />
        <Route path="/feedback/:id" element={<DetailedPost />} />
        <Route path="/add-comment/:feedbackId" element={<AddComment />} />
      </Routes>
    </Router>
  );
}

export default App;






