
import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { Avatar } from './Avatar';

interface CallInterfaceProps {
  user: User;
  isLive: boolean;
  onHangUp: () => void;
  isConnecting?: boolean;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({ user, isLive, onHangUp, isConnecting }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (isConnecting) return;
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnecting]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-between py-20 px-6 text-white animate-in fade-in duration-300">
      <div className="flex flex-col items-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#002D2D] rounded-full animate-ping opacity-30 scale-150"></div>
          <div className="absolute inset-0 bg-[#004D4D] rounded-full animate-pulse opacity-20 scale-125"></div>
          <Avatar user={user} size="lg" />
        </div>
        <h2 className="text-3xl font-bold mb-2 tracking-tight">{user.name}</h2>
        <p className="text-[#002D2D] font-bold bg-white px-4 py-1 rounded-full text-xs uppercase tracking-widest shadow-lg">
          {isConnecting ? 'Connecting...' : (isLive ? 'Live AI Session' : 'Voice Call')}
        </p>
        {!isConnecting && (
          <p className="mt-6 text-2xl font-mono opacity-80">{formatTime(seconds)}</p>
        )}
      </div>

      <div className="w-full max-w-xs flex justify-around items-center">
        <button className="p-4 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors shadow-lg active:scale-95">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
        <button 
          onClick={onHangUp}
          className="p-7 bg-red-600 rounded-full hover:bg-red-700 transition-all shadow-xl shadow-red-900/40 active:scale-95 border-4 border-white/10"
        >
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.26 1.12.32 2.33.49 3.57.49.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.17 2.45.49 3.57.1.35.01.74-.26 1.02l-2.2 2.2z" />
          </svg>
        </button>
        <button className="p-4 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors shadow-lg active:scale-95">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
