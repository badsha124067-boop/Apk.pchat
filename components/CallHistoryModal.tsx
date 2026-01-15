
import React from 'react';
import { CallRecord, User } from '../types';

interface Props {
  history: CallRecord[];
  users: User[];
  onClose: () => void;
  onClear: () => void;
}

export const CallHistoryModal: React.FC<Props> = ({ history, users, onClose, onClear }) => {
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (seconds?: number) => {
    if (seconds === undefined) return 'Missed';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getCallIcon = (type: CallRecord['type']) => {
    switch (type) {
      case 'outgoing':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        );
      case 'incoming':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        );
      case 'missed':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        <header className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Call History</h2>
          <div className="flex items-center space-x-2">
            {history.length > 0 && (
              <button 
                onClick={onClear}
                className="text-xs font-bold text-red-500 hover:text-red-600 px-3 py-1 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear All
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <p className="text-sm">No recent calls</p>
            </div>
          ) : (
            [...history].reverse().map((call) => {
              const user = users.find(u => u.id === call.userId);
              return (
                <div key={call.id} className="flex items-center p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all group">
                  <img src={user?.avatar || ''} className="w-10 h-10 rounded-full border border-gray-200" alt="" />
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Unknown'}</h4>
                      <span className="text-[10px] text-gray-400 font-medium">{formatTime(call.timestamp)}</span>
                    </div>
                    <div className="flex items-center mt-0.5 space-x-2">
                      <div className="flex items-center space-x-1">
                        {getCallIcon(call.type)}
                        <span className={`text-[11px] font-semibold ${call.type === 'missed' ? 'text-red-500' : 'text-gray-500'}`}>
                          {call.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">•</span>
                      <span className="text-[11px] text-gray-500 font-medium">{formatDuration(call.duration)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
