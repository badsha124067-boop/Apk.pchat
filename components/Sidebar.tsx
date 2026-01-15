
import React, { useState } from 'react';
import { User, Message } from '../types';
import { Avatar } from './Avatar';
import { Logo } from './Logo';

interface SidebarProps {
  users: User[];
  messages: Message[];
  activeUserId: string | null;
  onSelectUser: (userId: string) => void;
  currentUser: User;
  onAddById: (userId: string) => void;
  typingUsers: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  users, 
  messages, 
  activeUserId, 
  onSelectUser, 
  currentUser, 
  onAddById,
  typingUsers 
}) => {
  const [search, setSearch] = useState('');
  const [addId, setAddId] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const filteredUsers = users.filter(u => 
    u.id !== currentUser.id && 
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase()))
  );

  const getLastMessage = (userId: string) => {
    return messages
      .filter(m => (m.senderId === userId && m.receiverId === currentUser.id) || (m.senderId === currentUser.id && m.receiverId === userId))
      .sort((a, b) => b.timestamp - a.timestamp)[0];
  };

  const formatLastSeen = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addId.trim()) {
      onAddById(addId.trim().toLowerCase());
      setAddId('');
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-4 bg-white sticky top-0 z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo size={32} />
            <h1 className="text-xl font-bold text-[#002D2D] tracking-tight">pchat</h1>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`p-2 rounded-xl transition-all ${isAdding ? 'bg-[#002D2D] text-white' : 'bg-[#002D2D]/5 text-[#002D2D] hover:bg-[#002D2D]/10'}`}
            title="Add user by ID"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddSubmit} className="animate-in slide-in-from-top duration-200">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter User ID..."
                className="flex-1 bg-gray-100 border-none rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-[#002D2D] focus:bg-white outline-none"
                value={addId}
                onChange={(e) => setAddId(e.target.value)}
                autoFocus
              />
              <button 
                type="submit"
                className="bg-[#002D2D] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
              >
                Add
              </button>
            </div>
          </form>
        )}

        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-gray-100 border-none rounded-xl py-2 px-10 text-sm focus:ring-2 focus:ring-[#002D2D] focus:bg-white transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-sm">No conversations found.</p>
          </div>
        ) : (
          filteredUsers.map(user => {
            const lastMsg = getLastMessage(user.id);
            const isActive = activeUserId === user.id;
            const isTyping = typingUsers.includes(user.id);

            return (
              <button
                key={user.id}
                onClick={() => onSelectUser(user.id)}
                className={`w-full flex items-center p-4 transition-colors hover:bg-gray-50 text-left ${
                  isActive ? 'bg-[#002D2D]/5 border-r-4 border-[#002D2D]' : ''
                }`}
              >
                <Avatar user={user} />
                <div className="ml-4 flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline">
                    <h3 className={`font-semibold truncate ${isActive ? 'text-[#002D2D]' : 'text-gray-900'}`}>
                      {user.name}
                    </h3>
                    {!isTyping && lastMsg && (
                      <span className="text-xs text-gray-400">
                        {formatLastSeen(lastMsg.timestamp)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-xs mt-0.5">
                    {isTyping ? (
                      <span className="text-[#002D2D] font-bold animate-pulse flex items-center">
                        typing
                        <span className="ml-0.5 inline-flex">
                          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                        </span>
                      </span>
                    ) : (
                      <>
                        <span className="bg-gray-100 px-1 rounded mr-2 text-gray-400">@{user.username}</span>
                        <p className="truncate flex-1 text-gray-400">
                          {lastMsg ? lastMsg.text : (user.isAI ? 'Gemini AI is ready' : 'New chat')}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
