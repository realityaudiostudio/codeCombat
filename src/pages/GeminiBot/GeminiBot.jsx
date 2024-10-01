import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import "./styles.css";

const API_KEY = "AIzaSyDKv4gjBMYe_OszgWMz7Lcns4900oVBhP0"; // Replace with your actual API key
const genAI = new GoogleGenerativeAI(API_KEY);

const GeminiBot = ({ handleToolUse, userData }) => {
  console.log(userData.virtualCoins);

  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const [userInput, setUserInput] = useState("");
  const [wordCount, setWordCount] = useState(0); // State for word count
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Flag for submission in progress

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const handleInputChange = (event) => {
    const inputText = event.target.value;
    const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;

    // Block further input if the word count exceeds 100
    if (wordCount > 100) {
      event.preventDefault();
      return;
    }

    // Dynamically adjust the textarea height
    event.target.style.height = "auto"; // Reset the height
    event.target.style.height = event.target.scrollHeight + "px"; // Set it to scroll height

    // Update word count and user input state
    setWordCount(wordCount);
    setUserInput(inputText);
  };

  const handleSubmit = async (event) => {
    if (event) event.preventDefault(); // Prevent default form submission

    if (userInput.trim() === "" || userData.virtualCoins < 40 || isSubmitting) {
      return;
    }

    setIsSubmitting(true); // Set submission flag to true
    setIsLoading(true);
    const newUserMessage = { role: "User", content: userInput };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setUserInput("");
    setWordCount(0); // Reset word count

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(userInput);
      const newAssistantMessage = {
        role: "Assistant",
        content: result.response.text(),
      };
      setMessages((prevMessages) => [...prevMessages, newAssistantMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "Assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false); // Reset submission flag after completion

      // Reset textarea height after submission
      const textarea = document.querySelector(".input-field");
      if (textarea) {
        textarea.style.height = "auto"; // Reset to default small size
      }
    }
  };

  return (
    <div className="chatbot-container">
      <h2>
        <b>GEMINI CHATBOT</b> - Chat continuation based on previous messages not
        available. <b>Give relevant details for each message.</b>
      </h2>
      <ul className="message-list">
        {messages.map((message, index) => (
          <li key={index} className={message.role}>
            <strong>{message.role}:</strong>
            {message.role === "Assistant" ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : (
              message.content
            )}
          </li>
        ))}
      </ul>
      <form className="input-container" onSubmit={handleSubmit}>
        <textarea
          className="input-field"
          value={userInput}
          onChange={handleInputChange}
          disabled={userData.virtualCoins < 40 || isLoading || isSubmitting}
          rows="1" // Starting height
        />
        <button
          className="send-button"
          onClick={() => {
            handleSubmit();
            handleToolUse("aiAssistance");
          }}
          disabled={userData.virtualCoins < 40 || isLoading || isSubmitting} // Disable button when submitting or loading
        >
          Send (COST: )
        </button>
      </form>
      {/* Display the word count */}
      <p>Word count: {wordCount}/100</p>

      {isLoading && <p>Loading...</p>}
    </div>
  );
};

export default GeminiBot;
