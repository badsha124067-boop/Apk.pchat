
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { MessageBubble } from './components/MessageBubble';
import { Avatar } from './components/Avatar';
import { Auth } from './components/Auth';
import { CallInterface } from './components/CallInterface';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { CallHistoryModal } from './components/CallHistoryModal';
import { ProfileModal } from './components/ProfileModal';
import { Logo } from './components/Logo';
import { User, Message, NotificationSettings, CallRecord } from './types';
import { MOCK_USERS, STORAGE_KEYS, DEFAULT_NOTIFICATION_SETTINGS, NOTIFICATION_SOUNDS } from './constants';
import { getAIResponse } from './services/geminiService';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { decodeBase64, decodeAudioData, createPcmBlob } from './services/liveAudioService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [appReady, setAppReady] = useState(false);
  
  // Modal States
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Settings & History
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  
  // Call States
  const [activeCallUser, setActiveCallUser] = useState<User | null>(null);
  const [isConnectingCall, setIsConnectingCall] = useState(false);
  const callStartTimeRef = useRef<number | null>(null);
  
  // Live API Refs
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
    const savedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const savedDrafts = localStorage.getItem(STORAGE_KEYS.DRAFTS);
    const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const savedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const savedCalls = localStorage.getItem(STORAGE_KEYS.CALL_HISTORY);
    
    if (savedAuth) setCurrentUser(JSON.parse(savedAuth));
    if (savedMessages) setMessages(JSON.parse(savedMessages));
    if (savedDrafts) setDrafts(JSON.parse(savedDrafts));
    if (savedNotifs) setNotificationSettings(JSON.parse(savedNotifs));
    if (savedCalls) setCallHistory(JSON.parse(savedCalls));
    
    if (savedUsers) {
      const parsedStoredUsers: User[] = JSON.parse(savedUsers);
      const combined = [...MOCK_USERS];
      parsedStoredUsers.forEach(u => {
        if (!combined.find(m => m.id === u.id)) {
          combined.push(u);
        }
      });
      setAllUsers(combined);
    }
    
    setAppReady(true);
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  }, [currentUser]);

  useEffect(() => {
    if (appReady) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notificationSettings));
      localStorage.setItem(STORAGE_KEYS.CALL_HISTORY, JSON.stringify(callHistory));
    }
  }, [messages, notificationSettings, callHistory, appReady]);

  useEffect(() => {
    if (appReady) {
      const customUsers = allUsers.filter(u => !MOCK_USERS.find(m => m.id === u.id));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(customUsers));
    }
  }, [allUsers, appReady]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeUserId, typingUsers]);

  const triggerNotificationFeedback = useCallback((senderId: string, messageText: string) => {
    if (senderId === currentUser?.id) return;
    if (notificationSettings.mutedUserIds.includes(senderId)) return;

    const sender = allUsers.find(u => u.id === senderId);

    if (notificationSettings.systemEnabled && document.visibilityState === 'hidden' && Notification.permission === 'granted') {
      new Notification(sender?.name || 'New Message', {
        body: messageText,
        icon: sender?.avatar || '/favicon.ico',
        tag: 'pchat-new-msg'
      });
    }

    if (notificationSettings.enabled) {
      setNotification(`New message from ${sender?.name}`);
      setTimeout(() => setNotification(null), 3000);
    }

    if (notificationSettings.sound !== 'none') {
      const audio = new Audio(NOTIFICATION_SOUNDS[notificationSettings.sound]);
      audio.play().catch(() => {});
    }

    if (notificationSettings.vibration && navigator.vibrate) {
      navigator.vibrate(200);
    }
  }, [notificationSettings, currentUser, allUsers]);

  const handleAuthComplete = (user: User) => {
    setCurrentUser(user);
    setAllUsers(prev => {
      if (prev.find(u => u.username === user.username)) return prev;
      return [...prev, user];
    });
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    showNotification(`ID @${user.username} registered!`);
  };

  const handleUpdateProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setShowProfileModal(false);
    showNotification("Profile updated successfully!");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveUserId(null);
  };

  const handleAddUserById = (username: string) => {
    if (username === currentUser?.username) {
      showNotification("You can't add yourself!");
      return;
    }
    const foundUser = allUsers.find(u => u.username === username);
    if (foundUser) {
      setActiveUserId(foundUser.id);
      showNotification(`Started chat with @${username}`);
    } else {
      showNotification(`User @${username} not found!`);
    }
  };

  const toggleMute = (userId: string) => {
    setNotificationSettings(prev => {
      const isMuted = prev.mutedUserIds.includes(userId);
      return {
        ...prev,
        mutedUserIds: isMuted 
          ? prev.mutedUserIds.filter(id => id !== userId)
          : [...prev.mutedUserIds, userId]
      };
    });
    const user = allUsers.find(u => u.id === userId);
    showNotification(notificationSettings.mutedUserIds.includes(userId) ? `Unmuted ${user?.name}` : `Muted ${user?.name}`);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (!currentUser) return;
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;
      const reactions = { ...(msg.reactions || {}) };
      const users = [...(reactions[emoji] || [])];
      if (users.includes(currentUser.id)) {
        reactions[emoji] = users.filter(id => id !== currentUser.id);
      } else {
        reactions[emoji] = [...users, currentUser.id];
      }
      return { ...msg, reactions };
    }));
  };

  const handleSendMessage = async (text: string, mediaUrl?: string) => {
    if (!currentUser || (!text.trim() && !mediaUrl) || !activeUserId) return;
    const activeUser = allUsers.find(u => u.id === activeUserId);
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: activeUserId,
      text: text.trim(),
      timestamp: Date.now(),
      read: false,
      type: mediaUrl ? 'image' : 'text',
      mediaUrl
    };

    setMessages(prev => [...prev, newMessage]);
    setDrafts(prev => {
      const newDrafts = { ...prev };
      delete newDrafts[activeUserId];
      return newDrafts;
    });

    if (activeUser?.isAI) {
      setTypingUsers(prev => [...new Set([...prev, activeUserId])]);
      const history = messages
        .filter(m => (m.senderId === currentUser.id && m.receiverId === activeUserId) || (m.senderId === activeUserId && m.receiverId === currentUser.id))
        .map(m => ({
          role: m.senderId === currentUser.id ? 'user' as const : 'model' as const,
          text: m.text
        }));
      history.push({ role: 'user', text });
      
      const aiText = await getAIResponse(history);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        senderId: activeUserId,
        receiverId: currentUser.id,
        text: aiText,
        timestamp: Date.now(),
        read: false,
        type: 'text'
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setTypingUsers(prev => prev.filter(id => id !== activeUserId));
      triggerNotificationFeedback(activeUserId, aiText);
    } else if (activeUserId) {
      setTypingUsers(prev => [...new Set([...prev, activeUserId])]);
      setTimeout(() => setTypingUsers(prev => prev.filter(id => id !== activeUserId)), 2000);
    }
  };

  const showNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStartCall = async (user: User) => {
    setActiveCallUser(user);
    setIsConnectingCall(true);
    callStartTimeRef.current = Date.now();

    if (user.isAI) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = { input: inputCtx, output: outputCtx };
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          callbacks: {
            onopen: () => {
              setIsConnectingCall(false);
              const source = inputCtx.createMediaStreamSource(stream);
              const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmData = createPcmBlob(inputData);
                sessionPromise.then(session => session.sendRealtimeInput({ media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' } }));
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputCtx.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (audioBase64) {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                const audioBuffer = await decodeAudioData(decodeBase64(audioBase64), outputCtx, 24000, 1);
                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                audioSourcesRef.current.add(source);
                source.onended = () => audioSourcesRef.current.delete(source);
              }
            },
            onerror: () => handleHangUp(),
            onclose: () => handleHangUp(),
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            systemInstruction: 'You are a friendly friend on a phone call.'
          }
        });
        liveSessionRef.current = await sessionPromise;
      } catch (err) { handleHangUp(); }
    } else { setTimeout(() => setIsConnectingCall(false), 1500); }
  };

  const handleHangUp = () => {
    if (activeCallUser && callStartTimeRef.current) {
      const duration = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
      setCallHistory(prev => [...prev, {
        id: Date.now().toString(),
        userId: activeCallUser.id,
        type: 'outgoing',
        timestamp: callStartTimeRef.current!,
        duration: isConnectingCall ? undefined : duration
      }]);
    }
    if (liveSessionRef.current) liveSessionRef.current.close();
    if (audioContextRef.current) { audioContextRef.current.input.close(); audioContextRef.current.output.close(); }
    audioSourcesRef.current.forEach(s => s.stop());
    audioSourcesRef.current.clear();
    setActiveCallUser(null);
    setIsConnectingCall(false);
  };

  if (!appReady) return null;
  if (!currentUser) return <Auth onAuthComplete={handleAuthComplete} />;

  const activeUser = allUsers.find(u => u.id === activeUserId);
  const isUserTyping = activeUserId ? typingUsers.includes(activeUserId) : false;
  const currentChatMessages = messages.filter(m => activeUserId && ((m.senderId === currentUser.id && m.receiverId === activeUserId) || (m.senderId === activeUserId && m.receiverId === currentUser.id)));
  const isMuted = activeUserId ? notificationSettings.mutedUserIds.includes(activeUserId) : false;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {showSettingsModal && <NotificationSettingsModal settings={notificationSettings} users={allUsers} onUpdate={setNotificationSettings} onClose={() => setShowSettingsModal(false)} />}
      {showCallHistory && <CallHistoryModal history={callHistory} users={allUsers} onClose={() => setShowCallHistory(false)} onClear={() => confirm("Clear call history?") && setCallHistory([])} />}
      {showProfileModal && <ProfileModal user={currentUser} onSave={handleUpdateProfile} onClose={() => setShowProfileModal(false)} />}
      {activeCallUser && <CallInterface user={activeCallUser} isLive={activeCallUser.isAI || false} onHangUp={handleHangUp} isConnecting={isConnectingCall} />}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110]">
          <div className="bg-[#002D2D] text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-2 border border-[#002D2D]/20 animate-in fade-in slide-in-from-top duration-300">
            <Logo size={20} />
            <span className="text-sm font-medium">{notification}</span>
          </div>
        </div>
      )}

      <div className="flex w-full max-w-6xl mx-auto bg-white shadow-2xl overflow-hidden md:m-4 md:rounded-3xl">
        <aside className={`${activeUserId ? 'hidden md:block' : 'block'} w-full md:w-80 lg:w-96 flex-shrink-0 relative`}>
          <Sidebar users={allUsers} messages={messages} activeUserId={activeUserId} onSelectUser={setActiveUserId} currentUser={currentUser} onAddById={handleAddUserById} typingUsers={typingUsers} />
          <div className="absolute bottom-4 left-4 right-4 flex space-x-2">
             <button onClick={() => setShowCallHistory(true)} className="flex-1 flex items-center justify-center space-x-1 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-[10px] font-bold shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>Calls</span>
             </button>
             <button onClick={() => setShowProfileModal(true)} className="flex-1 flex items-center justify-center space-x-1 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-[10px] font-bold shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span>Profile</span>
             </button>
             <button onClick={() => setShowSettingsModal(true)} className="flex-1 flex items-center justify-center space-x-1 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-[10px] font-bold shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                <span>Prefs</span>
             </button>
             <button onClick={handleLogout} className="flex-1 flex items-center justify-center space-x-1 py-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors text-[10px] font-bold shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span>Out</span>
             </button>
          </div>
        </aside>

        <main className={`${!activeUserId ? 'hidden md:flex' : 'flex'} flex-1 flex-col relative`}>
          {activeUser ? (
            <>
              <header className="flex items-center justify-between p-4 border-b border-gray-100 bg-white z-10 shadow-sm">
                <div className="flex items-center">
                  <button onClick={() => setActiveUserId(null)} className="md:hidden mr-4 p-2 hover:bg-gray-100 rounded-full text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                  <Avatar user={activeUser} />
                  <div className="ml-3">
                    <h2 className="font-bold text-gray-900 leading-tight flex items-center">{activeUser.name} {isMuted && <svg className="w-3 h-3 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M13.431 16.711l-2.008-2.008c-.378.188-.802.297-1.423.297-1.472 0-2.831-.762-3.832-1.928-.68-.792-1.127-1.688-1.321-2.483l-2.086-2.086c-.512.427-.88 1.01-1.042 1.681-.242.977.018 2.02.662 2.872 1.251 1.656 3.425 2.656 5.618 2.656.772 0 1.542-.124 2.274-.36l2.164 2.164.694-.694z" /></svg>}</h2>
                    <p className={`text-[10px] font-bold ${isUserTyping ? 'text-[#002D2D] animate-pulse' : 'text-green-500'}`}>{isUserTyping ? 'typing...' : activeUser.status}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => toggleMute(activeUser.id)} className={`p-2 rounded-full transition-colors ${isMuted ? 'text-[#002D2D] bg-[#002D2D]/10' : 'text-gray-400 hover:bg-gray-100'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg></button>
                  <button onClick={() => handleStartCall(activeUser)} className="p-2 text-[#002D2D] bg-[#002D2D]/10 rounded-full hover:bg-[#002D2D]/20 transition-all"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg></button>
                </div>
              </header>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f0f2f5] custom-scrollbar">
                {currentChatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-40"><Logo size={64} className="mb-4" /><p className="text-xs font-bold">Encrypted chat with @{activeUser.username}</p></div>
                ) : (
                  currentChatMessages.map((msg) => <MessageBubble key={msg.id} message={msg} isMe={msg.senderId === currentUser.id} onShare={() => navigator.clipboard.writeText(msg.text) && showNotification("Copied!")} onReact={handleReaction} currentUserId={currentUser.id} />)
                )}
                {isUserTyping && <div className="flex justify-start mb-4"><div className="bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100 flex space-x-1"><div className="w-1.5 h-1.5 bg-[#002D2D] rounded-full animate-bounce [animation-delay:0ms]"></div><div className="w-1.5 h-1.5 bg-[#002D2D] rounded-full animate-bounce [animation-delay:150ms]"></div><div className="w-1.5 h-1.5 bg-[#002D2D] rounded-full animate-bounce [animation-delay:300ms]"></div></div></div>}
              </div>

              <footer className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-end space-x-2 max-w-4xl mx-auto">
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-[#002D2D] mb-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file && activeUserId) { const reader = new FileReader(); reader.onloadend = () => handleSendMessage("Shared an image", reader.result as string); reader.readAsDataURL(file); } }} />
                  <textarea rows={1} placeholder="Message..." className="flex-1 bg-gray-100 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#002D2D] focus:bg-white outline-none transition-all resize-none max-h-32" value={drafts[activeUserId] || ''} onChange={(e) => setDrafts(prev => ({ ...prev, [activeUserId]: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage(drafts[activeUserId] || ''))} />
                  <button onClick={() => handleSendMessage(drafts[activeUserId] || '')} disabled={!drafts[activeUserId]?.trim()} className={`p-3 rounded-full transition-all ${drafts[activeUserId]?.trim() ? 'bg-[#002D2D] text-white shadow-lg hover:bg-black active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}><svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg></button>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] p-12 text-center">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl mb-6 animate-pulse"><Logo size={80} className="opacity-80" /></div>
              <h2 className="text-3xl font-extrabold text-[#002D2D] mb-4">pchat community</h2>
              <p className="text-gray-500 italic font-medium">"Connecting worlds with unique IDs"</p>
            </div>
          )}
        </main>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,45,45,0.2); border-radius: 10px; }
      `}} />
    </div>
  );
};

export default App;
