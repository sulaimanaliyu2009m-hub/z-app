import React from 'react';
import { useNavigate } from 'react-router-dom';

interface UserAvatarProps {
  username?: string;
  avatarUrl?: string | null;
  displayName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hasStory?: boolean;
  onStoryClick?: () => void;
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  avatarUrl,
  displayName,
  size = 'md',
  hasStory = false,
  onStoryClick,
  className = '',
}) => {
  const navigate = useNavigate();

  const getInitials = () => {
    const name = displayName || username || '?';
    return name.slice(0, 2).toUpperCase();
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasStory && onStoryClick) {
      onStoryClick();
    } else if (username) {
      navigate(`/u/${username}`);
    }
  };

  const ringStyle = hasStory
    ? 'p-[2px] bg-gradient-to-tr from-sky-400 to-indigo-600 rounded-full cursor-pointer hover:opacity-90'
    : '';

  return (
    <div className={`relative inline-block select-none ${ringStyle} ${className}`} onClick={handleAvatarClick}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={username || 'User avatar'}
          className={`${sizeClasses[size]} rounded-full object-cover bg-neutral-200 dark:bg-neutral-800 cursor-pointer`}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 text-white font-bold flex items-center justify-center cursor-pointer`}
        >
          {getInitials()}
        </div>
      )}
    </div>
  );
};
