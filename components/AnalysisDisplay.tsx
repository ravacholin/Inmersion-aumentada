import React, { useState, useRef } from 'react';
import { AnalysisResult, Phrase } from '../types';
import { SparkleIcon, CloseIcon, RethinkIcon, ShuffleIcon, GlobeIcon } from './Icons';
import { generateSpeech, decode, decodeAudioData } from '../services/geminiService';
import PhraseCard from './PhraseCard';
import SpeechInput from './SpeechInput';

interface AnalysisDisplayProps {
  result: AnalysisResult;
  imageSrc: string;
  onClose: () => void;
  onReanalyze: (customPrompt: string, targetLanguage: string) => void;
  isRethinking: boolean;
  onGenerateMore: () => void;
  isGeneratingMore: boolean;
  isPhraseSaved: (phrase: Phrase) => boolean;
  onToggleSave: (phrase: Phrase) => void;
  initialLanguage: string;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, imageSrc, onClose, onReanalyze, isRethinking, onGenerateMore, isGeneratingMore, isPhraseSaved, onToggleSave, initialLanguage }) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [targetLanguage, setTargetLanguage] = useState(initialLanguage);
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

  const handleRethinkClick = () => {
    if (canRethink && !isRethinking) {
      onReanalyze(customPrompt, targetLanguage);
    }
  };
  
  const languageChanged = targetLanguage.trim().toLowerCase() !== initialLanguage.trim().toLowerCase();
  const canRethink = (customPrompt.trim() || languageChanged) && targetLanguage.trim();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center animate-fade-in p-2 sm:p-4">
      <div className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] bg-gray-900/70 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl m-4 overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-20 bg-gray-800/50 hover:bg-gray-700/70 rounded-full p-1"
          aria-label="Close analysis"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <SparkleIcon className="w-7 h-7 text-cyan-400 flex-shrink-0" />
            <h2 className="text-2xl font-bold text-white tracking-wide">
              Contextual Analysis
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <img 
                src={imageSrc} 
                alt={result.objectName} 
                className="w-full h-auto object-cover rounded-xl shadow-lg border-2 border-gray-700"
              />
              <p className="text-center mt-4 text-sm text-gray-400 italic">
                Identified: <span className="font-semibold text-gray-300">{result.objectName}</span>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Useful Spanish Phrases:</h3>
              <div className="space-y-4">
                {result.phrases.map((phrase, index) => (
                  <PhraseCard
                    key={index}
                    phrase={phrase}
                    isSaved={isPhraseSaved(phrase)}
                    onToggleSave={() => onToggleSave(phrase)}
                    isPlaying={playingPhrase === phrase.spanish}
                    onPlay={() => handlePlayAudio(phrase.spanish)}
                  />
                ))}
              </div>

              <button
                onClick={onGenerateMore}
                disabled={isGeneratingMore || isRethinking}
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700/70 text-white font-semibold rounded-md hover:bg-gray-600/70 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                  {isGeneratingMore ? (
                      <>
                          <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span>
                          <span>Generating...</span>
                      </>
                  ) : (
                      <>
                          <ShuffleIcon className="w-5 h-5" />
                          <span>Generate New Phrases</span>
                      </>
                  )}
              </button>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="text-md font-semibold text-gray-200 mb-3">Refine Results:</h4>

                <div className="mb-4">
                  <label htmlFor="language-input" className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <GlobeIcon className="w-4 h-4" />
                    Translate to language or country:
                  </label>
                  <input
                    id="language-input"
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    placeholder="e.g., French, Brazil, Japanese"
                    className="w-full bg-gray-900/70 border border-gray-600 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                    disabled={isRethinking || isGeneratingMore}
                  />
                </div>
                
                <div className="relative">
                  <label htmlFor="context-input" className="text-sm text-gray-400 mb-2 block">
                    Add context (optional):
                  </label>
                  <textarea
                    id="context-input"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="E.g., I'm a beginner, at a restaurant..."
                    className="w-full bg-gray-900/70 border border-gray-600 rounded-md p-2 pr-12 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                    rows={2}
                    disabled={isRethinking || isGeneratingMore}
                  />
                   <SpeechInput 
                    onTranscript={(transcript) => setCustomPrompt(prev => prev ? `${prev} ${transcript}` : transcript)}
                    disabled={isRethinking || isGeneratingMore}
                  />
                </div>

                <button
                    onClick={handleRethinkClick}
                    disabled={isRethinking || isGeneratingMore || !canRethink}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-md hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-600 disabled:from-gray-600 disabled:scale-100 disabled:cursor-not-allowed"
                >
                    {isRethinking ? (
                        <>
                            <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span>
                            <span>Updating...</span>
                        </>
                    ) : (
                        <>
                            <RethinkIcon className="w-5 h-5" />
                            <span>Update Results</span>
                        </>
                    )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;