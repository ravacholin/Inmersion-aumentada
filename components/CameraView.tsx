import React, { useEffect, useState, useRef } from 'react';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ videoRef, isActive }) => {
  const [error, setError] = useState<string | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        // Clear previous error
        setError(null);
        // Stop any existing stream before starting a new one
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access the camera. Please check permissions.");
      }
    };

    const stopCamera = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    }

    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [videoRef, isActive]);
  
  if (error) {
    return <div className="absolute inset-0 flex items-center justify-center bg-black text-red-400 p-4">{error}</div>;
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};

export default CameraView;