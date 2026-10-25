import React from 'react';
import { useNavigate } from 'react-router-dom';

export function ClickableText({ text = '', className = '' }: { text: string; className?: string }) {
  const navigate = useNavigate();
  const words = text.split(/(\s+)/);

  return (
    <p className={`whitespace-pre-wrap break-words ${className}`}>
      {words.map((word, i) => {
        if (word.startsWith('#') && word.length > 1) {
          const tag = word.slice(1).replace(/[^a-zA-Z0-9_]/g, '');
          return (
            <span
              key={i}
              onClick={(e) => { e.stopPropagation(); navigate(`/discover?tag=${tag}`); }}
              className="text-sky-500 font-medium hover:underline cursor-pointer"
            >
              {word}
            </span>
          );
        }
        if (word.startsWith('@') && word.length > 1) {
          const handle = word.slice(1).replace(/[^a-zA-Z0-9_]/g, '');
          return (
            <span
              key={i}
              onClick={(e) => { e.stopPropagation(); navigate(`/u/${handle}`); }}
              className="text-sky-500 font-semibold hover:underline cursor-pointer"
            >
              {word}
            </span>
          );
        }
        return word;
      })}
    </p>
  );
}
