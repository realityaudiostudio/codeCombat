import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      await login(email, password);
  
      // Ensure login was successful before navigating
      // If login is asynchronous, you may want to wait for confirmation
  
      // Optional: Check if login was successful before navigating
      // For example, you might have a way to verify login state or user info
  
      navigate('/dashboard'); // Ensure this is the correct path
    } catch (err) {
      console.error('Login failed:', err.message);
      setError(err.message); // Show error message if login fails
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {/* Title Section */}
      <div className="w-full max-w-4xl p-4 bg-blue-600 text-white text-center">
        <h1 className="text-3xl font-bold">Code Combat</h1>
      </div>

      {/* Guideline Section */}
      <div className="w-full max-w-4xl p-4 flex justify-between">
        <p className="text-gray-700">Guideline 1: Ensure your details are correct.</p>
        <p className="text-gray-700">Guideline 2: Contact support if you face issues.</p>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-sm p-8 bg-white shadow-md rounded-lg mt-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
