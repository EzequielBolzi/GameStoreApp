import React, { useState } from 'react';
import { faBuilding, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CompanyRegister from './RegisterCompany';  // Previous company registration form
import UserRegister from './RegisterUser';        // Previous user registration form

const RegisterPage = () => {
  const [registrationType, setRegistrationType] = useState('user'); // 'user' or 'company'

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Toggle Button Group */}
      <div className="flex justify-center mb-8 bg-gray-100 p-1 rounded-lg">
        <button
          className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
            registrationType === 'user'
              ? 'bg-white shadow-md text-blue-600'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setRegistrationType('user')}
        >
          <FontAwesomeIcon icon={faUser} />
          <span> Individual</span>
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
            registrationType === 'company'
              ? 'bg-white shadow-md text-blue-600'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setRegistrationType('company')}
        >
          <FontAwesomeIcon icon={faBuilding} />
          <span> Company</span>
        </button>
      </div>

      {/* Form Container with Animation */}
      <div className="relative">
        <div
          className={`transition-all duration-300 ${
            registrationType === 'user' ? 'opacity-100 z-10' : 'opacity-0 z-0 absolute top-0 left-0 w-full'
          }`}
        >
          {registrationType === 'user' && <UserRegister />}
        </div>
        <div
          className={`transition-all duration-300 ${
            registrationType === 'company' ? 'opacity-100 z-10' : 'opacity-0 z-0 absolute top-0 left-0 w-full'
          }`}
        >
          {registrationType === 'company' && <CompanyRegister />}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;