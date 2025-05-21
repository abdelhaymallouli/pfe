import React from 'react';
import { FaUser } from 'react-icons/fa';

const Dashboard: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4 bg-white">
                <h2 className="text-xl font-semibold mb-4">Welcome to your dashboard!</h2>
                <p className="mb-4">You have successfully logged in.</p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">Your Profile Information:</h3>
                  <p><strong>Username:</strong> {user.username || 'Not available'}</p>
                  <p><strong>Email:</strong> {user.email || 'Not available'}</p>
                  <p><strong>ID:</strong> {user.id || 'Not available'}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
