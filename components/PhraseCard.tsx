import React, { useState } from 'react';
import { Phrase } from '../types';
import { BookmarkIcon, SpeakerIcon } from './Icons';

interface PhraseCardProps {
  phrase: Phrase;
  isSaved: boolean;
  onToggleSave: () => void;
  isPlaying: boolean;
  onPlay: () => void;
}

const PhraseCard: React.FC<PhraseCardProps> = ({ phrase, isSaved, onToggleSave, isPlaying, onPlay }) => {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopyPhrase = async () => {
    try {
      await navigator.clipboard.writeText(phrase.spanish);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4 transition-all duration-300 hover:bg-gray-700/60 hover:border-white/20 flex items-center gap-4 animate-fade-in">
      <div
        className="flex-grow cursor-pointer relative"
        onClick={handleCopyPhrase}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCopyPhrase();
          }
        }}
        aria-label={`Copy phrase: ${phrase.spanish}`}
      >
        <p className="text-lg text-white font-medium">{phrase.spanish}</p>
        <p className="text-sm text-gray-400 mt-1">{phrase.translation}</p>
        {showCopied && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-cyan-500 text-white text-xs px-3 py-1 rounded-full shadow-lg animate-fade-in">
            ¡Copiado!
          </div>
        )}
      </div>
      <div className="flex items-center flex-shrink-0 gap-1">
        <button
          onClick={onPlay}
          disabled={isPlaying}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-colors rounded-full disabled:text-gray-600 disabled:cursor-not-allowed hover:bg-white/10"
          aria-label={`Listen to "${phrase.spanish}"`}
        >
          {isPlaying ? (
            <div className="w-5 h-5 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin"></div>
          ) : (
            <SpeakerIcon className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={onToggleSave}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
          aria-label={isSaved ? 'Unsave phrase' : 'Save phrase'}
          aria-pressed={isSaved}
        >
          <BookmarkIcon
            filled={isSaved}
            className={`w-6 h-6 transition-all duration-200 ${isSaved ? 'text-cyan-400 scale-110' : 'text-gray-500 hover:text-cyan-400'}`}
          />
        </button>
      </div>
    </div>
  );
};

export default PhraseCard;