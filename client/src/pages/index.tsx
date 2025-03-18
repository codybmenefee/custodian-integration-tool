import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Custodian Integration Tool
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          A tool to automate custodian integration patterns for wealth tech platforms.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200 font-medium">
            Get Started
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition duration-200 font-medium">
            Documentation
          </button>
        </div>
      </div>
    </div>
  );
} 