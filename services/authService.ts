
import { User } from '../types';

export const loginWithEmail = async (email: string, password: string, username: string): Promise<User> => {
  // Simulate API Latency
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    id: 'me-' + Math.random().toString(36).substr(2, 9),
    username: username || email.split('@')[0],
    name: email.split('@')[0],
    email: email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    status: 'online'
  };
};

export const loginWithTikTok = async (username: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  return {
    id: 'tt-' + Math.random().toString(36).substr(2, 9),
    username: username || 'tiktok_user',
    name: 'TikTok User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tiktok',
    status: 'online'
  };
};

export const loginWithPhone = async (phone: string, username: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    id: 'ph-' + Math.random().toString(36).substr(2, 9),
    username: username || 'user_' + phone.slice(-4),
    name: 'User ' + phone.slice(-4),
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phone',
    status: 'online'
  };
};
