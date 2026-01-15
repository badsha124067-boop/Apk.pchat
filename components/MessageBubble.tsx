
import React, { useState } from 'react';
import { Message } from '../types';
import { speakText } from '../services/ttsService';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  onShare: (msg: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  currentUserId: string;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMe, onShare, onReact, currentUserId }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleReadText = async () => {
    if (isReading) return;
    setIsReading(true);
    await speakText(message.text);
    setIsReading(false);
  };

  const activeReactions = message.reactions 
    ? (Object.entries(message.reactions) as [string, string[]][]).filter(([_, users]) => users.length > 0) 
    : [];

  return (
    <div className={`flex w-full mb-6 ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`group relative max-w-[75%] sm:max-w-[60%] transition-all duration-200`}>
        <div className={`px-4 py-2 rounded-2xl shadow-sm hover:shadow-md transition-all ${
          isMe 
            ? 'bg-[#002D2D] text-white rounded-br-none' 
            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
        }`}>
          {message.type === 'image' && message.mediaUrl && (
            <img 
              src={message.mediaUrl} 
              alt="Shared content" 
              className="rounded-lg mb-2 max-h-64 object-cover w-full cursor-pointer hover:opacity-90"
            />
          )}
          <p className="text-sm md:text-base whitespace-pre-wrap break-words">
            {message.text}
          </p>
          <div className={`flex items-center mt-1 text-[10px] opacity-70 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <span>{formatTime(message.timestamp)}</span>
            {isMe && (
              <span className="ml-1">
                {message.read ? (
                  <svg className="w-3 h-3 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
            )}
          </div>
        </div>

        {activeReactions.length > 0 && (
          <div className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} flex flex-wrap gap-1 z-10`}>
            {activeReactions.map(([emoji, users]) => {
              const hasReacted = users.includes(currentUserId);
              return (
                <button
                  key={emoji}
                  onClick={() => onReact(message.id, emoji)}
                  className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full border text-[11px] shadow-sm transition-all ${
                    hasReacted 
                      ? 'bg-[#002D2D]/10 border-[#002D2D]/20 text-[#002D2D]' 
                      : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="font-bold">{users.length}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className={`absolute top-0 ${isMe ? '-left-16' : '-right-16'} flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
          <div className="relative">
            <button 
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
              className="p-1.5 text-gray-400 hover:text-[#002D2D] rounded-full hover:bg-white transition-all shadow-sm"
              title="React"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            {showReactions && (
              <div 
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
                className={`absolute ${isMe ? 'left-8' : 'right-8'} -top-2 bg-white rounded-full shadow-xl border border-gray-100 p-1 flex items-center space-x-1 animate-in zoom-in-90 duration-200 z-[20]`}
              >
                {REACTION_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(message.id, emoji);
                      setShowReactions(false);
                    }}
                    className="w-7 h-7 flex items-center justify-center hover:scale-125 transition-transform duration-200 text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleReadText}
            className={`p-1.5 rounded-full hover:bg-white transition-all shadow-sm ${isReading ? 'text-[#002D2D] animate-pulse' : 'text-gray-400 hover:text-[#002D2D]'}`}
            title="Read Message Out Loud"
            disabled={isReading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>

          <button 
            onClick={() => onShare(message)}
            className="p-1.5 text-gray-400 hover:text-[#002D2D] rounded-full hover:bg-white transition-all shadow-sm"
            title="Copy Text"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
