import React, { useState } from 'react';
import axios from 'axios';
import Button from './components/Button';
import { useNavigate } from 'react-router-dom';
import login from './assets/login.svg';
import { API_BASE } from './api';

const AuthForm: React.FC<{ isSignUp: boolean; userType: 'Student' | 'Admin' }> = ({ isSignUp, userType }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Determine endpoint based on userType and isSignUp
    const endpoint = isSignUp
      ? userType === 'Student'
        ? 'student-signup'
        : 'admin-signup'
      : userType === 'Student'
      ? 'login-student'
      : 'login-admin';

    try {
      const response = await axios.post(
        `${API_BASE}/${endpoint}`,
        { name, password, userType },
        { withCredentials: true }
      );

      if (response.data.success) {
        if (isSignUp) {
          // After successful sign up, redirect to the appropriate login page
          const loginPath = userType === 'Student' ? '/login-student' : '/login-admin';
          navigate(loginPath);
        } else {
          // After successful login, redirect to communities
          navigate('/communities');
        }
      } else {
        console.error(response.data.error);
      }
    } catch (error: any) {
      if (error.response && error.response.data.error) {
        setError(error.response.data.error);
      }
    }
  };

  const handleLogout = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await axios.post(`${API_BASE}/logout`, {}, { withCredentials: true });

      if (response.data.success) {
        // Redirect to the signup page for the current userType
        const signupPath = userType === 'Student' ? '/student-signup' : '/admin-signup';
        navigate(signupPath);
      } else {
        console.error(response.data.error);
      }
    } catch (error: any) {
      if (error.response && error.response.data.error) {
        setError(error.response.data.error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img src={login} alt="My SVG" />
          <h2 className="mt-6 text-center text-3xl montserrat-bold text-gray-900">
            {isSignUp ? `Sign Up as a ${userType}` : `Log In as a ${userType}`}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div >
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 mb-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mt-3 flex justify-center space-x-6" >
              {isSignUp ? (
                <Button onClick={handleSubmit}  variant = "primary" className="px-5 py-2">Sign up</Button>
              ) : (
                <>
                  <Button onClick={handleSubmit}  variant = "primary"  className="px-5 py-2">Log In</Button>
                  <Button onClick={handleLogout}  variant = "primary"  className="px-5 py-2">Log Out</Button>
                </>
              )}
            </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
          </div>
        </form>
      </div>
    </div>
  );
};

export const SignUpStudentPage = () => <AuthForm isSignUp={true} userType="Student" />;
export const LogInStudentPage = () => <AuthForm isSignUp={false} userType="Student" />;
export const SignUpAdminPage = () => <AuthForm isSignUp={true} userType="Admin" />;
export const LogInAdminPage = () => <AuthForm isSignUp={false} userType="Admin" />;
