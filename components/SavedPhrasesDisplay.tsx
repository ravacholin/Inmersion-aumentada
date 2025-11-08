import React, { useState, useRef } from 'react';
import { Phrase } from '../types';
import { CloseIcon, SpeakerIcon } from './Icons';
import { generateSpeech, decode, decodeAudioData } from '../services/geminiService';
import PhraseCard from './PhraseCard';

interface SavedPhrasesDisplayProps {
  phrases: Phrase[];
  onClose: () => void;
  onUnsave: (phrase: Phrase) => void;
}

const SavedPhrasesDisplay: React.FC<SavedPhrasesDisplayProps> = ({ phrases, onClose, onUnsave }) => {
    const [playingPhrase, setPlayingPhrase] = useState<string | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
  
    const getAudioContext = () => {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      return audioContextRef.current;
    }
  
    const handlePlayAudio = async (text: string) => {
        if (playingPhrase) return;
        setPlayingPhrase(text);
        try {
            const audioContext = getAudioContext();
            const base64Audio = await generateSpeech(text);
            const audioBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.onended = () => {
                setPlayingPhrase(null);
            };
            source.start();
        } catch (err) {
            console.error("Error playing audio", err);
            setPlayingPhrase(null);
        }
    };


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center animate-fade-in p-2 sm:p-4">
      <div className="relative w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl m-4 flex flex-col">
        <header className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Saved Phrases</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close saved phrases"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 sm:p-6 overflow-y-auto">
          {phrases.length > 0 ? (
            <div className="space-y-4">
              {phrases.map((phrase, index) => (
                <PhraseCard
                  key={index}
                  phrase={phrase}
                  isSaved={true}
                  onToggleSave={() => onUnsave(phrase)}
                  isPlaying={playingPhrase === phrase.spanish}
                  onPlay={() => handlePlayAudio(phrase.spanish)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">You haven't saved any phrases yet.</p>
              <p className="text-sm text-gray-500 mt-2">Click the bookmark icon on a phrase to save it here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedPhrasesDisplay;
