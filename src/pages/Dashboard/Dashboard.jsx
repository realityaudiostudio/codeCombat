// src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { FaRobot, FaCode, FaQuestionCircle, FaExchangeAlt, FaClock, FaUser, FaCoins, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const toolCosts = {
  gpt: 50,
  codeSnippet: 30,
  askMentor: 40,
  swapProgram: 60,
  timeExtended: 20
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(docRef, (doc) => {
        const data = doc.data();
        console.log('User data:', data); // Debugging line
        setUserData(data);
      }, (error) => {
        console.error('Error fetching user data:', error); // Error handling
      });

      return () => unsubscribe(); // Cleanup subscription on unmount
    }
  }, [user]);

  const handleToolUse = async (tool) => {
    if (!userData) return; // Ensure userData is available

    const cost = toolCosts[tool];
    if (userData.virtualCoins >= cost) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, {
          [`usage.${tool}`]: true,
          virtualCoins: userData.virtualCoins - cost
        });

        setMessage('');
      } catch (error) {
        console.error('Error updating tool usage:', error);
      }
    } else {
      setMessage('Insufficient coins.');
    }
  };

  if (!userData) {
    return <p>Loading...</p>; // or a redirect to login
  }

  // Retrieve team name directly from userData
  const teamName = userData.teamName || 'No team name set';
  const { virtualCoins, usage: toolStatus, hackerRankPoints: points } = userData;

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      {/* Title Section */}
      <div className="w-full max-w-4xl p-4 bg-blue-600 text-white text-center">
        <h1 className="text-3xl font-bold">Code Combat</h1>
      </div>

      {/* Welcome User Section */}
      <div className="w-full max-w-4xl p-4 mt-4 bg-white shadow-md rounded-lg flex items-center justify-between">
        <div className="flex items-center">
          <FaUser className="text-2xl text-gray-600 mr-2" />
          <p className="text-lg font-semibold">Welcome, {teamName}</p> {/* Display team name */}
        </div>

        {/* Logout Button */}
        <button 
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none" 
          onClick={logout}
        >
          <FaSignOutAlt className="mr-2" />
          Logout
        </button>
      </div>

      {/* Points Section */}
      <div className="w-full max-w-4xl p-4 mt-4 bg-white shadow-md rounded-lg text-center">
        <h2 className="text-2xl font-semibold mb-2">Current Points</h2>
        <p className="text-3xl font-bold">{points !== undefined ? points : 'Loading...'}</p>
      </div>

      {/* Virtual Coins Section */}
      <div className="w-full max-w-4xl p-4 mt-4 bg-white shadow-md rounded-lg text-center">
        <div className="flex items-center justify-center">
          <FaCoins className="text-4xl text-yellow-500 mr-2" />
          <div>
            <h2 className="text-2xl font-semibold mb-2">Virtual Coins</h2>
            <p className="text-3xl font-bold">{virtualCoins !== undefined ? virtualCoins : 'Loading...'}</p>
          </div>
        </div>
      </div>

      {/* Message Section */}
      {message && (
        <div className="w-full max-w-4xl p-4 mt-4 bg-red-200 text-red-800 rounded-lg text-center">
          <p className="text-xl font-semibold">{message}</p>
        </div>
      )}

      {/* Tools Section */}
      <div className="w-full max-w-4xl p-4 mt-4 grid grid-cols-2 gap-4">
        {!toolStatus?.gpt && (
          <div className="flex flex-col items-center bg-white p-4 shadow-md rounded-lg">
            <FaRobot className="text-4xl mb-2 text-blue-600" />
            <p className="font-semibold">Use Chat GPT</p>
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => handleToolUse('gpt')}
            >
              Use (Cost: 50)
            </button>
          </div>
        )}
        {!toolStatus?.codeSnippet && (
          <div className="flex flex-col items-center bg-white p-4 shadow-md rounded-lg">
            <FaCode className="text-4xl mb-2 text-green-600" />
            <p className="font-semibold">Get Code Snippet</p>
            <button
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => handleToolUse('codeSnippet')}
            >
              Use (Cost: 30)
            </button>
          </div>
        )}
        {!toolStatus?.askMentor && (
          <div className="flex flex-col items-center bg-white p-4 shadow-md rounded-lg">
            <FaQuestionCircle className="text-4xl mb-2 text-yellow-600" />
            <p className="font-semibold">Ask Mentor</p>
            <button
              className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              onClick={() => handleToolUse('askMentor')}
            >
              Use (Cost: 40)
            </button>
          </div>
        )}
        {!toolStatus?.swapProgram && (
          <div className="flex flex-col items-center bg-white p-4 shadow-md rounded-lg">
            <FaExchangeAlt className="text-4xl mb-2 text-purple-600" />
            <p className="font-semibold">Swap Program</p>
            <button
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              onClick={() => handleToolUse('swapProgram')}
            >
              Use (Cost: 60)
            </button>
          </div>
        )}
        {!toolStatus?.timeExtended && (
          <div className="flex flex-col items-center bg-white p-4 shadow-md rounded-lg">
            <FaClock className="text-4xl mb-2 text-red-600" />
            <p className="font-semibold">Timer Extend</p>
            <button
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => handleToolUse('timeExtended')}
            >
              Use (Cost: 20)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
