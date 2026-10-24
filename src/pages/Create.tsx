import React from 'react';
import { Video, Image, FileText } from 'lucide-react';

export const Create: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Studio Hub</h2>
      <div className="grid grid-cols-3 gap-3">
        <button className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800 hover:border-brand-500">
          <Video className="text-brand-500" />
          <span className="text-xs font-semibold">Video Reel</span>
        </button>
        <button className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800 hover:border-brand-500">
          <Image className="text-brand-500" />
          <span className="text-xs font-semibold">Story / Photo</span>
        </button>
        <button className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800 hover:border-brand-500">
          <FileText className="text-brand-500" />
          <span className="text-xs font-semibold">Feed Post</span>
        </button>
      </div>
      <textarea
        placeholder="What's happening?"
        rows={4}
        className="w-full resize-none rounded-xl bg-neutral-100 p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:bg-neutral-900"
      />
    </div>
  );
};