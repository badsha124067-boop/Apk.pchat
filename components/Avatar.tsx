
import React from 'react';
import { User } from '../types';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500'
  };

  return (
    <div className={`relative inline-block ${sizeClasses[size]}`}>
      <img
        src={user.avatar}
        alt={user.name}
        className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
      />
      <div 
        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColors[user.status]}`}
        title={user.status}
      />
    </div>
  );
};
