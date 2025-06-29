import React from "react";
import { useNavigate } from "react-router-dom";
import './tailwind.css';
import './App.css';
import mySvg from './assets/discussion.svg';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleAdminSignUp = () => navigate("/admin-signup");
  const handleStudentSignUp = () => navigate("/student-signup");
  const handleAdminLogIn = () => navigate("/login-admin");
  const handleStudentLogIn = () => navigate("/login-student");

  return (
    <div className="flex items-center justify-center h-screen px-4">
      <div className="relative w-full max-w-4xl">
        {/* Responsive SVG positioned to right and lower on md+ screens */}
        <img
          src={mySvg}
          alt="Discussion"
          className="w-full max-w-xs sm:max-w-md h-auto mx-auto
                     mt-4 ml-4 sm:mt-0 sm:ml-0
                     md:absolute md:top-16 md:right-8 md:mx-0"
        />

        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
          <h1 className="text-4xl montserrat-bold mb-4">EduForums</h1>
          <div className="flex flex-wrap justify-center space-x-4 space-y-2 pointer-events-auto">
            <p
              className="text-lg cursor-pointer text-gray-700 hover:text-gray-900"
              onClick={handleAdminSignUp}
            >
              Sign Up as Admin
            </p>
            <p
              className="text-lg cursor-pointer text-gray-700 hover:text-gray-900"
              onClick={handleStudentSignUp}
            >
              Sign Up as Student
            </p>
          </div>
          <div className="flex flex-wrap justify-center space-x-4 mt-4 pointer-events-auto">
            <p
              className="text-lg cursor-pointer text-gray-700 hover:text-gray-900"
              onClick={handleAdminLogIn}
            >
              Log In as Admin
            </p>
            <p
              className="text-lg cursor-pointer text-gray-700 hover:text-gray-900"
              onClick={handleStudentLogIn}
            >
              Log In as Student
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
