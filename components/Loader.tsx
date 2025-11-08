import React from 'react';
import { SparkleIcon } from './Icons';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center">
      <div className="text-center p-6 bg-gray-900/70 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center justify-center gap-3">
          <SparkleIcon className="w-10 h-10 text-cyan-400 animate-spin-slow" />
          <p className="text-xl font-semibold text-white mt-2">Analyzing...</p>
          <p className="text-sm text-gray-400">Our AI is looking at the world.</p>
        </div>
      </div>
    </div>
  );
};

export default Loader;