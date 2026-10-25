import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';

interface UserLinkProps {
  username: string;
  displayName?: string;
  isVerified?: boolean;
  showHandle?: boolean;
  className?: string;
}

export const UserLink: React.FC<UserLinkProps> = ({
  username,
  displayName,
  isVerified = false,
  showHandle = false,
  className = '',
}) => {
  return (
    <Link
      to={`/u/${username}`}
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1 font-semibold text-neutral-900 dark:text-white hover:underline ${className}`}
    >
      <span>{displayName || username}</span>
      {isVerified && <BadgeCheck size={14} className="text-sky-500 fill-sky-500 text-white" />}
      {showHandle && <span className="text-neutral-500 font-normal text-xs">@{username}</span>}
    </Link>
  );
};
