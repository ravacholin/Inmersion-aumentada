import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AnalysisResult, Phrase, UserProfile } from './types';
import { analyzeImage } from './services/geminiService';
import CameraView from './components/CameraView';
import AnalysisDisplay from './components/AnalysisDisplay';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import { SparkleIcon, BookmarkIcon, UploadIcon, CameraIcon, SignOutIcon } from './components/Icons';
import SavedPhrasesDisplay from './components/SavedPhrasesDisplay';
import ImageUploader from './components/ImageUploader';
import LoginScreen from './components/LoginScreen';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isRethinking, setIsRethinking] = useState<boolean>(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState<boolean>(false);
  const [savedPhrases, setSavedPhrases] = useState<Phrase[]>([]);
  const [showSavedPhrases, setShowSavedPhrases] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [targetLanguage, setTargetLanguage] = useState<string>('English');
  const [inputMode, setInputMode] = useState<'camera' | 'upload'>('camera');
  const [orientation, setOrientation] = useState(window.screen.orientation?.angle ?? 0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('userProfile');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user profile from localStorage", e);
        localStorage.removeItem('userProfile');
      }
    }
  }, []);

  useEffect(() => {
    try {
      const storedPhrases = localStorage.getItem('savedPhrases');
      if (storedPhrases) {
        setSavedPhrases(JSON.parse(storedPhrases));
      }
    } catch (error) {
      console.error("Could not load saved phrases from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('savedPhrases', JSON.stringify(savedPhrases));
    } catch (error) {
      console.error("Could not save phrases to localStorage", error);
    }
  }, [savedPhrases]);

  useEffect(() => {
    if (analysisResult || error) {
      setIsCameraActive(false);
    } else {
      setIsCameraActive(inputMode === 'camera');
    }
  }, [inputMode, analysisResult, error]);

  useEffect(() => {
    if (!window.screen.orientation) {
      console.warn("screen.orientation API not supported.");
      return;
    }
    const handleOrientationChange = () => setOrientation(window.screen.orientation.angle);
    window.screen.orientation.addEventListener('change', handleOrientationChange);
    handleOrientationChange();
    return () => window.screen.orientation.removeEventListener('change', handleOrientationChange);
  }, []);
  
  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };

  const handleLogout = () => {
    if (user && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.revoke(user.email, (done: any) => {
        console.log('User token revoked.');
      });
    }
    setUser(null);
    localStorage.removeItem('userProfile');
  };

  const isPhraseSaved = useCallback((phrase: Phrase) => {
    return savedPhrases.some(p => p.spanish === phrase.spanish && p.translation === phrase.translation);
  }, [savedPhrases]);
  
  const handleToggleSave = useCallback((phrase: Phrase) => {
    setSavedPhrases(prev => {
      const isSaved = prev.some(p => p.spanish === phrase.spanish && p.translation === phrase.translation);
      if (isSaved) {
        return prev.filter(p => p.spanish !== phrase.spanish);
      } else {
        return [...prev, phrase];
      }
    });
  }, []);

  const handleAnalysisError = (err: unknown) => {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    if (errorMessage.includes('API_KEY')) {
        setError("The Gemini API key is not configured. Please set the API_KEY environment variable.");
    } else {
        setError(errorMessage);
    }
  }

  const handleCaptureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isLoading) return;
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      if (orientation === 90 || orientation === 270) {
        canvas.width = videoHeight;
        canvas.height = videoWidth;
      } else {
        canvas.width = videoWidth;
        canvas.height = videoHeight;
      }
      context.save();
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(orientation * Math.PI / 180);
      context.drawImage(video, -videoWidth / 2, -videoHeight / 2, videoWidth, videoHeight);
      context.restore();
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCurrentImage(dataUrl);
      setIsCameraActive(false);
      try {
        const base64Data = dataUrl.split(',')[1];
        if (!base64Data) throw new Error('Failed to capture image data.');
        const result = await analyzeImage(base64Data, targetLanguage);
        setAnalysisResult(result);
      } catch (err) {
        handleAnalysisError(err);
      } finally {
        setIsLoading(false);
      }
    } else {
        setError("Could not get canvas context to capture image.");
        setIsLoading(false);
    }
  }, [isLoading, targetLanguage, orientation]);

  const handleFileUploadAndAnalyze = useCallback(async (file: File) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCurrentImage(dataUrl);
        setIsCameraActive(false);
        try {
          const base64Data = dataUrl.split(',')[1];
          if (!base64Data) throw new Error('Failed to read image data.');
          const result = await analyzeImage(base64Data, targetLanguage, undefined, file.type);
          setAnalysisResult(result);
        } catch (err) {
            handleAnalysisError(err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setError("Could not read the uploaded file.");
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Error reading file.");
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  }, [isLoading, targetLanguage]);
  
  const handleReanalyze = useCallback(async (customPrompt: string, newLanguage: string) => {
    if (!currentImage || isRethinking || isLoading || isGeneratingMore) return;
    setIsRethinking(true);
    setError(null);
    setTargetLanguage(newLanguage);
    try {
        const base64Data = currentImage.split(',')[1];
        const mimeType = currentImage.match(/data:(.*);base64,/)?.[1] ?? 'image/jpeg';
        if (!base64Data) throw new Error('Failed to get image data for re-analysis.');
        const result = await analyzeImage(base64Data, newLanguage, customPrompt, mimeType);
        setAnalysisResult(result);
      } catch (err) {
        handleAnalysisError(err);
      } finally {
        setIsRethinking(false);
      }
  }, [currentImage, isRethinking, isLoading, isGeneratingMore]);
  
  const handleGenerateMore = useCallback(async () => {
    if (!currentImage || isRethinking || isLoading || isGeneratingMore) return;
    setIsGeneratingMore(true);
    setError(null);
    try {
        const base64Data = currentImage.split(',')[1];
        const mimeType = currentImage.match(/data:(.*);base64,/)?.[1] ?? 'image/jpeg';
        if (!base64Data) throw new Error('Failed to get image data for generating more phrases.');
        const result = await analyzeImage(base64Data, targetLanguage, "Generate a new and different set of phrases based on the image.", mimeType);
        setAnalysisResult(result);
      } catch (err) {
        handleAnalysisError(err);
      } finally {
        setIsGeneratingMore(false);
      }
  }, [currentImage, isRethinking, isLoading, isGeneratingMore, targetLanguage]);

  const handleCloseAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
    setCurrentImage(null);
  };

  if (!user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const showUI = !isLoading && !analysisResult && !error;

  return (
    <div className="h-screen w-screen bg-black overflow-hidden">
      <div className="absolute inset-0">
        <CameraView videoRef={videoRef} isActive={isCameraActive} />
        {currentImage && (
          <img src={currentImage} className="w-full h-full object-cover animate-fade-in" alt="Captured or uploaded scene" />
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {/* Main UI Overlay */}
      <div className={`absolute inset-0 flex flex-col justify-between p-4 sm:p-6 transition-opacity duration-300 ${showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <header className="flex items-center justify-between bg-black/40 backdrop-blur-md px-4 py-3 rounded-full">
          <div className="flex-1 flex justify-start">
            <img src={user.picture} alt={user.name} title={user.name} className="w-9 h-9 rounded-full border-2 border-cyan-500/50" />
          </div>
          <div className="flex items-center justify-center gap-3 flex-1">
            <SparkleIcon className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Inmersión Aumentada
            </h1>
          </div>
          <div className="flex-1 flex justify-end items-center gap-2">
            <button
              onClick={() => setInputMode(prev => prev === 'camera' ? 'upload' : 'camera')}
              className="relative text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              aria-label={`Switch to ${inputMode === 'camera' ? 'upload file' : 'camera'} mode`}
            >
              {inputMode === 'camera' ? <UploadIcon className="w-6 h-6" /> : <CameraIcon className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setShowSavedPhrases(true)}
              className="relative text-white/80 hover:text-white transition-colors"
              aria-label={`View saved phrases (${savedPhrases.length})`}
            >
              <BookmarkIcon className="w-7 h-7" />
              {savedPhrases.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-cyan-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {savedPhrases.length}
                </span>
              )}
            </button>
            <div className="w-px h-6 bg-white/20 mx-1"></div>
            <button
              onClick={handleLogout}
              className="relative text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              aria-label="Sign out"
            >
              <SignOutIcon className="w-6 h-6" />
            </button>
          </div>
        </header>

        {inputMode === 'camera' ? (
          <>
            <div className="flex-grow flex items-center justify-center pointer-events-none">
              <div className="w-[80vw] max-w-sm aspect-[4/3] relative flex flex-col items-center justify-center">
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-cyan-400 rounded-tl-2xl animate-pulse-corner-glow"></div>
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-cyan-400 rounded-tr-2xl animate-pulse-corner-glow" style={{animationDelay: '0.75s'}}></div>
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-cyan-400 rounded-bl-2xl animate-pulse-corner-glow" style={{animationDelay: '1.5s'}}></div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-cyan-400 rounded-br-2xl animate-pulse-corner-glow" style={{animationDelay: '2.25s'}}></div>
                  <div className="w-full h-full border-2 border-white/10 rounded-2xl"></div>
              </div>
            </div>
            <div className="flex justify-center items-end pb-4">
              <button
                onClick={handleCaptureAndAnalyze}
                disabled={isLoading}
                className="w-20 h-20 rounded-full bg-black/30 backdrop-blur-lg flex items-center justify-center transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 border-2 border-white/50 animate-pulse-glow"
                aria-label="Capture and Analyze"
              >
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <SparkleIcon className="w-9 h-9 text-gray-800" />
                </div>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-black/30 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-white/20 shadow-xl animate-fade-in">
              <h2 className="text-xl font-bold text-white text-center mb-1">Upload an Image</h2>
              <p className="text-gray-400 text-center mb-6">Let's see what we can learn from your photo.</p>
              <ImageUploader onAnalyze={handleFileUploadAndAnalyze} isLoading={isLoading} />
            </div>
          </div>
        )}
      </div>
      
      {/* Modal Overlays */}
      {isLoading && <Loader />}
      {error && <ErrorMessage message={error} onDismiss={handleCloseAnalysis} />}
      {analysisResult && currentImage && (
        <AnalysisDisplay 
          result={analysisResult} 
          imageSrc={currentImage} 
          onClose={handleCloseAnalysis}
          onReanalyze={handleReanalyze}
          isRethinking={isRethinking}
          onGenerateMore={handleGenerateMore}
          isGeneratingMore={isGeneratingMore}
          isPhraseSaved={isPhraseSaved}
          onToggleSave={handleToggleSave}
          initialLanguage={targetLanguage}
        />
      )}
       {showSavedPhrases && (
        <SavedPhrasesDisplay
          phrases={savedPhrases}
          onClose={() => setShowSavedPhrases(false)}
          onUnsave={handleToggleSave}
        />
      )}
    </div>
  );
};

export default App;
