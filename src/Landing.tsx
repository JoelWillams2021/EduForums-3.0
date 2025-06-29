import React from "react";
import { useNavigate } from "react-router-dom";
import './tailwind.css';
import './App.css';
import mySvg from './assets/discussion.svg';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="relative text-center">
        <img
          src={mySvg}
          alt="discussion illustration"
          className="mb-[-60px] max-w-[123%] sm:mb-0 sm:max-w-full"
        />
        <div className="absolute inset-0 flex justify-center items-center">
          <h1 className="text-4xl montserrat-bold">EduForums</h1>
         
            <p className="text-lg cursor-pointer text-gray-500" onClick={() => navigate("/admin-signup")}>
              Sign Up as Admin
            </p>
            <p className="text-lg cursor-pointer text-gray-500" onClick={() => navigate("/student-signup")}>
              Sign Up as Student
            </p>
            <p className="text-lg cursor-pointer text-gray-500" onClick={() => navigate("/login-admin")}>
              Log In as Admin
            </p>
            <p className="text-lg cursor-pointer text-gray-500" onClick={() => navigate("/login-student")}>
              Log In as Student
            </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
