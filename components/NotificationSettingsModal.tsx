
import React from 'react';
import { NotificationSettings, User } from '../types';
import { NOTIFICATION_SOUNDS } from '../constants';

interface Props {
  settings: NotificationSettings;
  users: User[];
  onUpdate: (settings: NotificationSettings) => void;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<Props> = ({ settings, users, onUpdate, onClose }) => {
  const toggleGlobal = () => onUpdate({ ...settings, enabled: !settings.enabled });
  
  const toggleSystem = async () => {
    if (!settings.systemEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        onUpdate({ ...settings, systemEnabled: true });
      } else {
        alert("Please enable notification permissions in your browser settings to use this feature.");
      }
    } else {
      onUpdate({ ...settings, systemEnabled: false });
    }
  };

  const toggleVibration = () => onUpdate({ ...settings, vibration: !settings.vibration });
  const setSound = (sound: NotificationSettings['sound']) => {
    onUpdate({ ...settings, sound });
    if (sound !== 'none') {
      const audio = new Audio(NOTIFICATION_SOUNDS[sound]);
      audio.play().catch(() => {});
    }
  };

  const unmuteUser = (userId: string) => {
    onUpdate({
      ...settings,
      mutedUserIds: settings.mutedUserIds.filter(id => id !== userId)
    });
  };

  const mutedUsers = users.filter(u => settings.mutedUserIds.includes(u.id));

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {/* Global Toggle */}
          <section className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">In-App Alerts</h3>
              <p className="text-sm text-gray-500">Show visual alerts inside pchat</p>
            </div>
            <button 
              onClick={toggleGlobal}
              className={`w-14 h-8 rounded-full transition-colors relative ${settings.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${settings.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </section>

          {/* System Toggle */}
          <section className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">System Notifications</h3>
              <p className="text-sm text-gray-500">Alerts when you're outside the app</p>
            </div>
            <button 
              onClick={toggleSystem}
              className={`w-14 h-8 rounded-full transition-colors relative ${settings.systemEnabled ? 'bg-green-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${settings.systemEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </section>

          {/* Sound Selection */}
          <section className={!settings.enabled ? 'opacity-50 pointer-events-none' : ''}>
            <h3 className="font-bold text-gray-900 mb-4">Alert Sound</h3>
            <div className="grid grid-cols-2 gap-3">
              {(['none', 'pop', 'ping', 'ding'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSound(s)}
                  className={`px-4 py-3 rounded-2xl text-sm font-semibold capitalize border-2 transition-all ${
                    settings.sound === s 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : 'border-gray-100 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Vibration */}
          <section className={`flex items-center justify-between ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <h3 className="font-bold text-gray-900">Haptic Vibration</h3>
              <p className="text-sm text-gray-500">Vibrate device on new messages</p>
            </div>
            <button 
              onClick={toggleVibration}
              className={`w-14 h-8 rounded-full transition-colors relative ${settings.vibration ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${settings.vibration ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </section>

          {/* Mute List */}
          <section>
            <h3 className="font-bold text-gray-900 mb-4">Muted Chats</h3>
            {mutedUsers.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No muted conversations.</p>
            ) : (
              <div className="space-y-3">
                {mutedUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                    <div className="flex items-center">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full mr-3" />
                      <span className="text-sm font-semibold text-gray-700">{u.name}</span>
                    </div>
                    <button 
                      onClick={() => unmuteUser(u.id)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      Unmute
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
