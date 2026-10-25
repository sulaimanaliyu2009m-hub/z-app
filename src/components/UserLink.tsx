import React from 'react';
import { useNavigate } from 'react-router-dom';

export function UserLink({
  username,
  children,
  className = ''
}: {
  username: string;
  userId?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const navigate = useNavigate();

  const handlePress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (username) {
      navigate(`/u/${username.replace(/^@/, '')}`);
    }
  };

  return (
    <span onClick={handlePress} className={`cursor-pointer inline-block ${className}`}>
      {children}
    </span>
  );
}
