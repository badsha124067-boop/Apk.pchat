
import { User, NotificationSettings } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'ai-assistant',
    username: 'gemini',
    name: 'Gemini AI',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai',
    status: 'online',
    isAI: true
  },
  {
    id: 'user-2',
    username: 'sarah_c',
    name: 'Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    status: 'online'
  },
  {
    id: 'user-3',
    username: 'alex_r',
    name: 'Alex Rivera',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    status: 'offline',
    lastSeen: Date.now() - 3600000
  },
  {
    id: 'user-4',
    username: 'jordan_s',
    name: 'Jordan Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
    status: 'away'
  },
  {
    id: 'user-5',
    username: 'elena_g',
    name: 'Elena Gilbert',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena',
    status: 'online'
  }
];

export const STORAGE_KEYS = {
  MESSAGES: 'pchat_messages',
  DRAFTS: 'pchat_drafts',
  SETTINGS: 'pchat_settings',
  AUTH: 'pchat_auth_session',
  USERS: 'pchat_registered_users',
  NOTIFICATIONS: 'pchat_notification_prefs',
  CALL_HISTORY: 'pchat_call_history'
};

export const NOTIFICATION_SOUNDS = {
  pop: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
  ping: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
  ding: 'https://assets.mixkit.co/active_storage/sfx/2359/2359-preview.mp3',
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  systemEnabled: false, // Default to false until user grants permission
  sound: 'pop',
  vibration: true,
  mutedUserIds: []
};
