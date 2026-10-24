import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { UserStoriesGroup } from '../types';

export function StoryViewer({
  groups,
  initialGroupIndex,
  onClose
}: {
  groups: UserStoriesGroup[];
  initialGroupIndex: number;
  onClose: () => void;
}) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeGroup = groups[groupIndex];
  const activeStory = activeGroup?.stories[storyIndex];

  // Auto-advance timer (5 seconds for photos)
  useEffect(() => {
    if (!activeStory || isPaused) return;

    setProgress(0);
    const duration = 5000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [groupIndex, storyIndex, isPaused, activeStory]);

  const handleNext = () => {
    if (!activeGroup) return;
    if (storyIndex < activeGroup.stories.length - 1) {
      setStoryIndex(storyIndex + 1);
      setProgress(0);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(groupIndex + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
      setProgress(0);
    } else if (groupIndex > 0) {
      setGroupIndex(groupIndex - 1);
      const prevGroup = groups[groupIndex - 1];
      setStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
    }
  };

  if (!activeGroup || !activeStory) return null;

  // CSS Filter Map
  const filterClasses: { [key: string]: string } = {
    normal: '',
    grayscale: 'grayscale',
    sepia: 'sepia',
    vintage: 'sepia contrast-125 brightness-90',
    cyberpunk: 'hue-rotate-180 contrast-125 saturate-150',
    warm: 'saturate-150'
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none">
      {/* Top Header & Segmented Progress Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3 bg-gradient-to-b from-black/80 to-transparent">
        {/* Progress Bars */}
        <div className="flex gap-1 mb-2">
          {activeGroup.stories.map((s, idx) => (
            <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-75"
                style={{
                  width: idx < storyIndex ? '100%' : idx === storyIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* User Info & Close */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-white overflow-hidden bg-neutral-800 flex items-center justify-center font-bold text-xs">
              {activeGroup.avatarUrl ? (
                <img src={activeGroup.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{activeGroup.displayName.charAt(0)}</span>
              )}
            </div>
            <div>
              <span className="text-xs font-bold">@{activeGroup.username}</span>
              <span className="text-[10px] text-neutral-400 ml-2">24h story</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full text-white">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Media Content */}
      <div 
        className="relative flex-1 flex items-center justify-center overflow-hidden bg-neutral-950"
        onPointerDown={() => setIsPaused(true)}
        onPointerUp={() => setIsPaused(false)}
      >
        {activeStory.mediaType === 'image' ? (
          <img
            src={activeStory.mediaUrl}
            alt="story"
            className={`max-h-full max-w-full object-contain ${filterClasses[activeStory.filterStyle || 'normal'] || ''}`}
          />
        ) : (
          <video
            src={activeStory.mediaUrl}
            autoPlay
            playsInline
            muted
            className={`max-h-full max-w-full object-contain ${filterClasses[activeStory.filterStyle || 'normal'] || ''}`}
          />
        )}

        {/* Text Overlay */}
        {activeStory.textOverlay && (
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 text-center pointer-events-none">
            <span className="inline-block bg-black/60 backdrop-blur-md text-white font-extrabold text-base px-4 py-2 rounded-2xl shadow-xl max-w-xs break-words">
              {activeStory.textOverlay}
            </span>
          </div>
        )}

        {/* Tap Zones: Left (30%) & Right (70%) */}
        <div
          onClick={handlePrev}
          className="absolute left-0 top-16 bottom-0 w-[30%] cursor-pointer z-20"
        />
        <div
          onClick={handleNext}
          className="absolute right-0 top-16 bottom-0 w-[70%] cursor-pointer z-20"
        />
      </div>
    </div>
  );
}
