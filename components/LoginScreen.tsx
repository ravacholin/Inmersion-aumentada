import React, { useEffect, useRef, useCallback } from 'react';
import { UserProfile } from '../types';
import { SparkleIcon } from './Icons';

// --- ACTION REQUIRED ---
// 1. Go to https://console.cloud.google.com/
// 2. Create an "OAuth 2.0 Client ID" for a "Web application".
// 3. Make sure to add your app's URL (e.g., http://localhost:3000) to the "Authorized JavaScript origins".
// 4. Copy the Client ID and paste it below.
const GOOGLE_CLIENT_ID = "628310347629-i2kbu9rohc3vdd70lbed6uhtv6a1oq4a.apps.googleusercontent.com";


interface LoginScreenProps {
  onLoginSuccess: (profile: UserProfile) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const signInButtonRef = useRef<HTMLDivElement>(null);

  const handleCredentialResponse = useCallback((response: any) => {
    if (!response.credential) {
      console.error("No credential in response", response);
      return;
    }
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const userProfile: UserProfile = {
        name: payload.name,
        picture: payload.picture,
        email: payload.email,
      };
      onLoginSuccess(userProfile);
    } catch (e) {
      console.error("Error decoding JWT", e);
    }
  }, [onLoginSuccess]);

  useEffect(() => {
    if (GOOGLE_CLIENT_ID.startsWith("YOUR_GOOGLE_CLIENT_ID")) {
        console.warn("Google Client ID is not set. Please update it in components/LoginScreen.tsx.");
        return;
    }

    if ((window as any).google?.accounts?.id) {
      const google = (window as any).google;
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      if (signInButtonRef.current) {
        google.accounts.id.renderButton(
          signInButtonRef.current,
          { theme: "filled_black", size: "large", type: "standard", text: "signin_with", shape: "pill" }
        );
      }
      google.accounts.id.prompt();
    } else {
      console.error("Google Identity Services script not loaded.");
    }
  }, [handleCredentialResponse]);

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <SparkleIcon className="w-10 h-10 text-cyan-400" />
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Inmersión Aumentada
          </h1>
        </div>
        <p className="text-gray-400 mb-8">
          An Augmented Reality app to learn contextual Spanish. Sign in to begin your journey.
        </p>
        
        {GOOGLE_CLIENT_ID.startsWith("YOUR_GOOGLE_CLIENT_ID") ? (
            <div className="bg-yellow-900/50 border border-yellow-500/50 text-yellow-200 px-4 py-3 rounded-lg">
                <p className="font-bold">Configuration Needed</p>
                <p className="text-sm">Please set your Google Client ID in the source code to enable login.</p>
            </div>
        ) : (
            <div ref={signInButtonRef} className="flex justify-center"></div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;