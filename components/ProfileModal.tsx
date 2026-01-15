
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Avatar } from './Avatar';

interface ProfileModalProps {
  user: User;
  onSave: (updatedUser: Partial<User>) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onSave, onClose }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, avatar });
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="p-6 text-center border-b border-gray-50">
          <h2 className="text-xl font-bold text-[#002D2D] tracking-tight">Profile Settings</h2>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex flex-col items-center">
            <div 
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#002D2D]/10 shadow-md group-hover:opacity-90 transition-all">
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
            </div>
            <p className="mt-3 text-[10px] font-extrabold text-[#002D2D] uppercase tracking-[0.2em]">Change Photo</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Display Name</label>
              <input
                type="text"
                className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#002D2D] focus:bg-white transition-all outline-none font-medium"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Unique ID</label>
              <div className="w-full px-5 py-3 bg-gray-100 border-none rounded-2xl text-[#002D2D] font-bold text-sm flex items-center">
                <span className="opacity-40 mr-1">@</span>{user.username}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3.5 bg-[#002D2D] text-white rounded-2xl font-bold shadow-xl shadow-[#002D2D]/20 hover:bg-black active:scale-95 transition-all"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
