import React from 'react';
import { currentUser } from '../services/mockData';

export const Profile: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        <img src={currentUser.avatar} alt="Avatar" className="h-16 w-16 rounded-full border-2 border-brand-500" />
        <div>
          <h2 className="text-lg font-bold">{currentUser.displayName}</h2>
          <p className="text-xs text-neutral-500">@{currentUser.username}</p>
        </div>
      </div>
      <div className="flex justify-around border-y border-neutral-200 py-3 text-center dark:border-neutral-800">
        <div>
          <div className="font-bold text-sm">342</div>
          <div className="text-xs text-neutral-500">Posts</div>
        </div>
        <div>
          <div className="font-bold text-sm">14.8k</div>
          <div className="text-xs text-neutral-500">Followers</div>
        </div>
        <div>
          <div className="font-bold text-sm">820</div>
          <div className="text-xs text-neutral-500">Following</div>
        </div>
      </div>
    </div>
  );
};