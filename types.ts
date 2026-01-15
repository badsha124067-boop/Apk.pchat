
export interface NotificationSettings {
  enabled: boolean;
  systemEnabled: boolean; // New: for browser/OS level notifications
  sound: 'none' | 'pop' | 'ping' | 'ding';
  vibration: boolean;
  mutedUserIds: string[];
}

export interface CallRecord {
  id: string;
  userId: string;
  type: 'incoming' | 'outgoing' | 'missed';
  timestamp: number;
  duration?: number; // in seconds
}

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: number;
  isAI?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  read: boolean;
  type: 'text' | 'image';
  mediaUrl?: string;
  reactions?: Record<string, string[]>; // emoji -> list of userIds
}

export interface ChatSession {
  participants: string[];
  lastMessage?: Message;
  draft?: string;
}

export type AppState = {
  currentUser: User | null;
  users: User[];
  messages: Message[];
  drafts: Record<string, string>;
  notificationSettings: NotificationSettings;
  callHistory: CallRecord[];
};
