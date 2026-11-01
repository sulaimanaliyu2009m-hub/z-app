import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ClickableText = ({ text }: { text: string }) => {
  const navigate = useNavigate();
  const parts = text.split(/(@\w+|#\w+)/g);
  
  return (
    <p>
      {parts.map((part, i) => {
        if (part.startsWith('@')) return <span key={i} className="text-sky-500 cursor-pointer" onClick={() => navigate(`/u/${part.slice(1)}`)}>{part}</span>;
        if (part.startsWith('#')) return <span key={i} className="text-sky-400 cursor-pointer" onClick={() => navigate(`/discover?tag=${part.slice(1)}`)}>{part}</span>;
        return part;
      })}
    </p>
  );
};