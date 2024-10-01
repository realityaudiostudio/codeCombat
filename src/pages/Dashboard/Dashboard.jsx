// src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { FaRobot, FaCode, FaHandsHelping, FaQuestionCircle, FaUser, FaCoins, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import GeminiBot from '../GeminiBot/GeminiBot';

const toolCosts = {
  aiAssistance: 40,
  codeSnippet: 50,
  pairProgramming: 50,
  answerQuestion: 70
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
        setUserData(data);
      }, (error) => {
        console.error('Error fetching user data:', error); // Error handling
      });

      return () => unsubscribe(); // Cleanup subscription on unmount
    }
  }, [user]);

  const handleToolUse = async (tool) => {    
    
    if (!userData) return;
  
    const cost = toolCosts[tool];
    if (userData.virtualCoins >= cost) {
      try {
        const docRef = doc(db, 'users', user.uid);
  
        // Increment tool usage count
        const newToolUsageCount = (userData.usage[tool] || 0) + 1;
  
        await updateDoc(docRef, {
          [`usage.${tool}`]: newToolUsageCount, // Store the new count in Firestore
          virtualCoins: userData.virtualCoins - cost // Deduct the virtual coins
        });
  
        // Update local state for immediate UI change
        setUserData((prevData) => ({
          ...prevData,
          usage: {
            ...prevData.usage,
            [tool]: newToolUsageCount
          },
        }));
  
        setMessage(`You used ${tool} and spent ${cost} coins. Tool used ${newToolUsageCount} times.`);
        
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
          <p className="text-lg font-semibold">Welcome, {teamName}</p>{" "}
          {/* Display team name */}
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
        <p className="text-3xl font-bold">
          {points !== undefined ? points : "Loading..."}
        </p>
      </div>

      {/* Virtual Coins Section */}
      <div className="w-full max-w-4xl p-4 mt-4 bg-white shadow-md rounded-lg text-center">
        <div className="flex items-center justify-center">
          <FaCoins className="text-4xl text-yellow-500 mr-2" />
          <div>
            <h2 className="text-2xl font-semibold mb-2">Virtual Coins</h2>
            <p className="text-3xl font-bold">
              {virtualCoins !== undefined ? virtualCoins : "Loading..."}
            </p>
          </div>
        </div>
      </div>

      {/* Message Section */}
      {message && (
        <div className="w-full max-w-4xl p-4 mt-4 bg-green-200 text-green-800 rounded-lg text-center">
          <p className="text-xl font-semibold">{message}</p>
        </div>
      )}

      {/* Tools Section */}
      <div className="w-full max-w-4xl p-4 mt-4 grid grid-cols-2 gap-4">
        {/* AI Assistance */}
        {/* <div className="flex flex-col items-center bg-white p-4 shadow-md rounded-lg">
          <FaRobot className="text-4xl mb-2 text-blue-600" />
          <p className="font-semibold">Use AI Assistance</p>
          <p className="text-sm text-green-600 mt-2">Tool Used {toolStatus?.aiAssistance ? `(${toolCosts.aiAssistance} coins spent)` : ''}</p>
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => handleToolUse('aiAssistance')}
          >
            Use (Cost: 40)
          </button>
        </div> */}

        {/* Code Snippet */}
        <div className="flex flex-col items-center bg-white p-4 shadow-md rounded-lg">
          <FaCode className="text-4xl mb-2 text-green-600" />
          <p className="font-semibold">Get Code Snippet</p>
          <p className="text-sm text-green-600 mt-2">
            Tool Used{" "}
            {toolStatus?.codeSnippet
              ? `(${toolCosts.codeSnippet} coins spent)`
              : ""}
          </p>
          <button
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => handleToolUse("codeSnippet")}
          >
            Use (Cost: 50)
          </button>
        </div>

        {/* Pair Programming */}
        <div className="flex flex-col items-center bg-white p-4 shadow-md rounded-lg">
          <FaHandsHelping className="text-4xl mb-2 text-purple-600" />
          <p className="font-semibold">Pair Programming</p>
          <p className="text-sm text-green-600 mt-2">
            Tool Used{" "}
            {toolStatus?.pairProgramming
              ? `(${toolCosts.pairProgramming} coins spent)`
              : ""}
          </p>
          <button
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            onClick={() => handleToolUse("pairProgramming")}
          >
            Use (Cost: 50)
          </button>
        </div>

        {/* Answer Question */}
        <div className="flex flex-col items-center bg-white p-4 shadow-md rounded-lg">
          <FaQuestionCircle className="text-4xl mb-2 text-yellow-600" />
          <p className="font-semibold">Answer Question</p>
          <p className="text-sm text-green-600 mt-2">
            Tool Used{" "}
            {toolStatus?.answerQuestion
              ? `(${toolCosts.answerQuestion} coins spent)`
              : ""}
          </p>
          <button
            className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            onClick={() => handleToolUse("answerQuestion")}
          >
            Use (Cost: 70)
          </button>
        </div>
  
      </div>
      <GeminiBot handleToolUse={handleToolUse} userData={userData} />
    </div>
  );
};

export default Dashboard;
