import React from 'react';
import { Link } from 'react-router-dom';

interface RichTextProps {
  content: string;
  className?: string;
}

export const RichText: React.FC<RichTextProps> = ({ content, className = '' }) => {
  const parts = content.split(/(@[a-zA-Z0-9_]+|#[a-zA-Z0-9_]+)/g);

  return (
    <span className={`whitespace-pre-wrap break-words ${className}`}>
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          const handle = part.slice(1);
          return (
            <Link
              key={index}
              to={`/u/${handle}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sky-500 hover:underline font-medium"
            >
              {part}
            </Link>
          );
        }
        if (part.startsWith('#')) {
          const tag = part.slice(1);
          return (
            <Link
              key={index}
              to={`/tag/${tag}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sky-400 hover:underline font-medium"
            >
              {part}
            </Link>
          );
        }
        return part;
      })}
    </span>
  );
};
