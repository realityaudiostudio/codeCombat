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
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Flag for submission in progress

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  // Updated handleSubmit with early return if already submitting
  const handleSubmit = async (event) => {
    if (event) event.preventDefault(); // Prevent default form submission

    if (userInput.trim() === "" || userData.virtualCoins < 40 || isSubmitting) {
      return;
    }

    setIsSubmitting(true); // Set submission flag to true
    setIsLoading(true);
    const newUserMessage = { role: "user", content: userInput };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setUserInput("");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(userInput);
      const newAssistantMessage = {
        role: "assistant",
        content: result.response.text(),
      };
      setMessages((prevMessages) => [...prevMessages, newAssistantMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false); // Reset submission flag after completion
    }
  };

  return (
    <div className="chatbot-container">
      <h2>Gemini chatbot</h2>
      <ul className="message-list">
        {messages.map((message, index) => (
          <li key={index} className={message.role}>
            <strong>{message.role}:</strong>
            {message.role === "assistant" ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : (
              message.content
            )}
          </li>
        ))}
      </ul>
      <form className="input-container" onSubmit={handleSubmit}>
        {/* Added form to prevent multiple submissions */}
        <input
          className="input-field"
          type="text"
          value={userInput}
          onChange={handleInputChange}
          disabled={userData.virtualCoins < 40 || isLoading || isSubmitting}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)} // Use onKeyDown for Enter key
        />
        <button
          className="send-button"
          onClick={() => {
            handleSubmit();
            handleToolUse("aiAssistance");
          }}
          disabled={userData.virtualCoins < 40 || isLoading || isSubmitting} // Disable button when submitting or loading
        >
          Send
        </button>
      </form>
      {isLoading && <p>Loading...</p>}
    </div>
  );
};

export default GeminiBot;
