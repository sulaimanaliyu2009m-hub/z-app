import React from 'react';
import { Plus } from 'lucide-react';
import type { UserStoriesGroup, User } from '../types';

export function StoryRow({
  currentUser,
  storyGroups,
  onOpenViewer,
  onOpenCreate
}: {
  currentUser: User;
  storyGroups: UserStoriesGroup[];
  onOpenViewer: (groupIndex: number) => void;
  onOpenCreate: () => void;
}) {
  const myStoriesGroup = storyGroups.find(g => g.userId === currentUser.id);
  const otherGroups = storyGroups.filter(g => g.userId !== currentUser.id);

  return (
    <div className="flex items-center gap-3 p-3 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800 no-scrollbar bg-white dark:bg-black">
      {/* 1. Your Story Bubble */}
      <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
        <div className="relative">
          <div 
            onClick={() => myStoriesGroup ? onOpenViewer(storyGroups.findIndex(g => g.userId === currentUser.id)) : onOpenCreate()}
            className={`w-14 h-14 rounded-full p-[2px] transition ${
              myStoriesGroup 
                ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' 
                : 'border-2 border-neutral-300 dark:border-neutral-700'
            }`}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{(currentUser.displayName || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>

          {/* Plus Badge */}
          <button
            onClick={(e) => { e.stopPropagation(); onOpenCreate(); }}
            className="absolute bottom-0 right-0 w-4 h-4 bg-sky-500 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-black"
          >
            <Plus size={10} strokeWidth={3} />
          </button>
        </div>
        <span className="text-[10px] text-neutral-500 truncate max-w-[60px]">Your story</span>
      </div>

      {/* 2. Other Users' Stories */}
      {otherGroups.map((group) => {
        const globalIndex = storyGroups.findIndex(g => g.userId === group.userId);
        return (
          <div
            key={group.userId}
            onClick={() => onOpenViewer(globalIndex)}
            className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-full overflow-hidden bg-black p-[2px]">
                <div className="w-full h-full rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center font-bold text-xs text-white">
                  {group.avatarUrl ? (
                    <img src={group.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{group.displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-neutral-500 truncate max-w-[60px]">@{group.username}</span>
          </div>
        );
      })}
    </div>
  );
}
