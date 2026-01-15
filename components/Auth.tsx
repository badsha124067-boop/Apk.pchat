
import React, { useState } from 'react';
import { loginWithEmail, loginWithTikTok, loginWithPhone } from '../services/authService';
import { User } from '../types';
import { Logo } from './Logo';

interface AuthProps {
  onAuthComplete: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthComplete }) => {
  const [mode, setMode] = useState<'options' | 'email' | 'phone' | 'tiktok'>('options');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', phone: '', username: '' });

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username) return alert("Please choose a unique ID");
    setIsLoading(true);
    try {
      const user = await loginWithEmail(formData.email, formData.password, formData.username);
      onAuthComplete(user);
    } catch (err) {
      alert("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTikTokLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username) return alert("Please choose a unique ID");
    setIsLoading(true);
    const user = await loginWithTikTok(formData.username);
    onAuthComplete(user);
    setIsLoading(false);
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username) return alert("Please choose a unique ID");
    setIsLoading(true);
    const user = await loginWithPhone(formData.phone, formData.username);
    onAuthComplete(user);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={80} className="drop-shadow-lg" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#002D2D] tracking-tight">pchat</h1>
          <p className="text-gray-500 mt-2 font-medium">Sign up to get your unique ID</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center py-10">
            <div className="w-12 h-12 border-4 border-[#002D2D] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#002D2D] font-medium animate-pulse">Setting up your profile...</p>
          </div>
        ) : (
          <>
            {mode === 'options' && (
              <div className="space-y-4">
                <button 
                  onClick={() => setMode('email')}
                  className="w-full flex items-center justify-center space-x-3 bg-[#002D2D] text-white py-3.5 rounded-xl hover:bg-black transition-all shadow-md active:scale-95 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Continue with Email</span>
                </button>

                <button 
                  onClick={() => setMode('tiktok')}
                  className="w-full flex items-center justify-center space-x-3 bg-black text-white py-3.5 rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-95 font-medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.59-5.71-.29-2.63.85-5.32 2.94-6.93 1.25-.97 2.82-1.52 4.41-1.5 1.15.03 2.3.36 3.28.98V8.28c-.91-.53-1.95-.87-3.02-.95-1.5-.13-3.07.18-4.35 1.01-1.47.96-2.45 2.6-2.6 4.36-.14 1.48.24 3 .99 4.31.74 1.34 2.01 2.45 3.51 2.91 1.31.42 2.74.37 4.02-.13 1.25-.49 2.33-1.43 2.91-2.64.44-.9.65-1.91.63-2.92-.01-4.24.02-8.48-.02-12.72Z"/>
                  </svg>
                  <span>Continue with TikTok</span>
                </button>

                <button 
                   onClick={() => setMode('phone')}
                   className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl hover:border-[#002D2D] hover:text-[#002D2D] transition-all shadow-sm active:scale-95 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Continue with Phone</span>
                </button>
              </div>
            )}

            {(mode === 'email' || mode === 'phone' || mode === 'tiktok') && (
              <form onSubmit={mode === 'email' ? handleEmailLogin : mode === 'phone' ? handlePhoneLogin : handleTikTokLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Choose your Unique ID</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#002D2D] focus:bg-white transition-all outline-none"
                    placeholder="e.g. dragon_slayer_99"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '_')})}
                  />
                  <p className="text-[10px] text-gray-400 mt-1 ml-1">This is how others can search and add you.</p>
                </div>

                {mode === 'email' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email Address</label>
                      <input 
                        required
                        type="email" 
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#002D2D] focus:bg-white transition-all outline-none"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Password</label>
                      <input 
                        required
                        type="password" 
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#002D2D] focus:bg-white transition-all outline-none"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </>
                )}

                {mode === 'phone' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Phone Number</label>
                    <div className="flex">
                      <span className="flex items-center px-4 bg-gray-100 rounded-l-xl text-gray-500 border-r border-gray-200 font-medium">+1</span>
                      <input 
                        required
                        type="tel" 
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-r-xl focus:ring-2 focus:ring-[#002D2D] focus:bg-white transition-all outline-none"
                        placeholder="(555) 000-0000"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-[#002D2D] text-white py-3.5 rounded-xl hover:bg-black shadow-lg shadow-[#002D2D]/20 transition-all font-bold mt-2 active:scale-95"
                >
                  Create Account
                </button>
                <button 
                  type="button"
                  onClick={() => setMode('options')}
                  className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors"
                >
                  Back to options
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
