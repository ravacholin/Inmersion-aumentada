import React, { useState, useEffect, useRef } from 'react';
import { MicrophoneIcon } from './Icons';

interface SpeechInputProps {
  onTranscript: (transcript: string) => void;
  disabled: boolean;
}

// FIX: Add minimal type definitions for the Web Speech API to resolve type errors,
// as it is a non-standard API and its types are not available in the project's configuration.
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onend: () => void;
  onerror: (event: any) => void;
  onresult: (event: any) => void;
  start: () => void;
  stop: () => void;
}

// Access browser-specific SpeechRecognition API
// FIX: Cast window to `any` to access non-standard properties and rename variable to avoid type name collision.
const SpeechRecognitionAPI =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const SpeechInput: React.FC<SpeechInputProps> = ({ onTranscript, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  // FIX: The type `SpeechRecognition` is no longer shadowed by a variable.
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // FIX: Use renamed variable.
    if (!SpeechRecognitionAPI) {
      console.warn('Speech recognition not supported by this browser.');
      return;
    }

    // FIX: Use renamed variable.
    const recognition: SpeechRecognition = new SpeechRecognitionAPI();
    recognition.continuous = false; // Stop after first utterance
    recognition.interimResults = false; // We only need the final result
    recognition.lang = 'en-US'; // Default language

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };
    
    recognitionRef.current = recognition;

    // Cleanup: stop recognition if the component unmounts
    return () => {
      recognition.stop();
    };
  }, [onTranscript]);

  const handleToggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch(e) {
        // This can happen if recognition is already starting
        console.error("Could not start speech recognition.", e);
      }
    }
  };

  // If the browser doesn't support the API, don't render the button
  // FIX: Use renamed variable.
  if (!SpeechRecognitionAPI) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleToggleListening}
      disabled={disabled}
      className={`absolute right-2 top-9 p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
        isListening
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-gray-700 text-gray-300 hover:bg-cyan-600 hover:text-white'
      } disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500`}
      aria-label={isListening ? 'Stop recording' : 'Start recording with microphone'}
    >
      <MicrophoneIcon className="w-5 h-5" />
    </button>
  );
};

export default SpeechInput;
