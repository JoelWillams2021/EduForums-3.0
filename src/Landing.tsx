import React from "react";
import { useNavigate } from "react-router-dom";
import './tailwind.css';
import './App.css';
import mySvg from './assets/discussion.svg';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  
  const handleAdminSignUp = () => {
    navigate("/admin-signup");
  };

  const handleStudentSignUp = () => {
    navigate("/student-signup");
  };

  const handleAdminLogIn = () => {
    navigate("/login-admin");
  };

  const handleStudentLogIn = () => {
    navigate("/login-student");
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="relative text-center">
        <img src={mySvg} alt="My SVG" />
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center">
          <h1 className="text-4xl montserrat-bold">EduForums</h1>
          <div className="flex justify-center space-x-6 mt-4 mr-6">
            <p className="text-lg cursor-pointer text-500" onClick={handleAdminSignUp}>Sign Up as Admin</p>
            <p className="text-lg cursor-pointer text-500" onClick={handleStudentSignUp}>Sign Up as Student</p>
          </div>
          <div className="flex justify-center space-x-6 mb-2 mr-3">
            <p className="text-lg cursor-pointer text-500" onClick={handleAdminLogIn}>Log In as Admin</p>
            <p className="text-lg cursor-pointer text-500" onClick={handleStudentLogIn}>Log In as Student</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;





  