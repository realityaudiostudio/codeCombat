import React, { useState } from 'react';
import axios from 'axios';

const GptUsage = () => {
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const maxResponses = 4;
  const retryDelay = 1000; // Initial delay of 1 second
  const maxRetries = 3;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (responses.length >= maxResponses) {
      alert('Response limit reached.');
      return;
    }

    setIsLoading(true);

    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: 'gpt-4', // Specify the model
              messages: [{ role: 'user', content: query }],
              max_tokens: 150, // Adjust as needed
            },
          {
            headers: {
              'Authorization': `Bearer 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`,
              'Content-Type': 'application/json',
            },
          }
        );

        const newResponse = response.data.choices[0].message.content.trim();
        setResponses(prevResponses => [...prevResponses, newResponse]);
        success = true;

      } catch (error) {
        if (error.response && error.response.status === 429) {
          // Rate limit error
          console.error('Rate limit exceeded. Retrying...');
          attempt += 1;
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt))); // Exponential backoff
        } else {
          // Other errors
          console.error('Error fetching response:', error.response ? error.response.data : error.message);
          break;
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      <div className="w-full max-w-4xl p-4 bg-blue-600 text-white text-center">
        <h1 className="text-3xl font-bold">Use Chat GPT</h1>
      </div>

      <div className="w-full max-w-4xl p-4 mt-4 bg-white shadow-md rounded-lg">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="query" className="block text-sm font-medium text-gray-700">Enter your query</label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows="4"
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Query'}
          </button>
        </form>
      </div>

      {responses.length > 0 && (
        <div className="w-full max-w-4xl p-4 mt-4 bg-white shadow-md rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Responses</h2>
          <div className="space-y-4">
            {responses.map((response, index) => (
              <div key={index} className="p-4 bg-gray-100 rounded-md shadow-sm">
                <p className="text-gray-900">{response}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GptUsage;
