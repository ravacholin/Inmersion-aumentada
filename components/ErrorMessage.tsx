import React from 'react';
import { CloseIcon } from './Icons';

interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center p-4">
        <div className="relative bg-red-900/50 backdrop-blur-xl border border-red-500/50 text-red-200 px-6 py-4 rounded-xl shadow-lg max-w-md w-full animate-fade-in" role="alert">
            <strong className="font-bold block mb-1">An Error Occurred</strong>
            <span className="block">{message}</span>
            <button
              onClick={onDismiss}
              className="absolute top-2 right-2 text-red-200 hover:text-white p-1"
              aria-label="Dismiss error"
            >
                <CloseIcon className="w-5 h-5" />
            </button>
        </div>
    </div>
  );
};

export default ErrorMessage;