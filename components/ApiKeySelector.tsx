import React, { useState, useEffect } from 'react';
import { SparkleIcon } from './Icons';

interface ApiKeySelectorProps {
  onApiKeySet: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if API key already exists in localStorage
    const existingKey = localStorage.getItem('gemini_api_key');
    if (existingKey) {
      setApiKey(existingKey);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }

    if (!apiKey.startsWith('AIza')) {
      setError('Invalid API key format. Gemini API keys typically start with "AIza"');
      return;
    }

    localStorage.setItem('gemini_api_key', apiKey.trim());
    setError('');
    onApiKeySet();
  };

  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setError('');
  };

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <SparkleIcon className="w-8 h-8 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Gemini API Key Required</h2>
        </div>

        <div className="mb-6 text-gray-300 text-sm space-y-3">
          <p className="leading-relaxed">
            <strong className="text-cyan-400">Why do I need this?</strong>
          </p>
          <p className="leading-relaxed">
            You've successfully logged in with <strong>Google OAuth</strong> (for authentication), but this app also needs a <strong>Gemini API key</strong> to power the AI image analysis.
          </p>
          <p className="leading-relaxed">
            These are two different Google services that require separate credentials.
          </p>
          <div className="bg-cyan-900/30 border border-cyan-500/50 rounded-lg p-3 mt-4">
            <p className="text-xs text-cyan-200">
              <strong>Get your free API key:</strong>
              <br />
              Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-400">aistudio.google.com/app/apikey</a>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter your Gemini API Key:
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 pr-20"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/50 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-cyan-500/50"
            >
              Save & Continue
            </button>
            {apiKey && (
              <button
                onClick={handleClear}
                className="px-4 py-3 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            Your API key is stored locally in your browser and never sent anywhere except to Google's Gemini API.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySelector;
