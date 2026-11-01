import React from 'react';
import { useNavigate } from 'react-router-dom';

export const UserLink = ({ username, children, className }: { username: string; children: React.ReactNode; className?: string }) => {
  const navigate = useNavigate();
  return (
    <span onClick={(e) => { e.stopPropagation(); navigate(`/u/${username}`); }} className={`cursor-pointer ${className}`}>
      {children}
    </span>
  );
};