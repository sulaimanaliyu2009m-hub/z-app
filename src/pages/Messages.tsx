import React from 'react';

export const Messages: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Direct Messages</h2>
      <div className="flex items-center gap-3 border-b border-neutral-100 py-3 dark:border-neutral-900">
        <div className="h-12 w-12 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <div className="flex-1">
          <div className="flex justify-between">
            <h4 className="text-sm font-semibold">Z Assistant Support</h4>
            <span className="text-xs text-neutral-400">12:30 PM</span>
          </div>
          <p className="text-xs text-neutral-500 truncate">Welcome to Z! Let me know if you need help.</p>
        </div>
      </div>
    </div>
  );
};