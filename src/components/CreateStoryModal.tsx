import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles, Type } from 'lucide-react';
import { api } from '../services/api';
import type { Story } from '../types';

export function CreateStoryModal({
  onClose,
  onStoryCreated
}: {
  onClose: () => void;
  onStoryCreated: (s: Story) => void;
}) {
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [textOverlay, setTextOverlay] = useState('');
  const [filterStyle, setFilterStyle] = useState('normal');
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filters = [
    { id: 'normal', name: 'Normal', class: '' },
    { id: 'vintage', name: 'Vintage', class: 'sepia contrast-125 brightness-90' },
    { id: 'cyberpunk', name: 'Cyberpunk', class: 'hue-rotate-180 contrast-125 saturate-150' },
    { id: 'grayscale', name: 'B&W', class: 'grayscale' },
    { id: 'sepia', name: 'Sepia', class: 'sepia' },
    { id: 'warm', name: 'Warm', class: 'saturate-150' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video')) {
      setMediaType('video');
      setMediaUrl(URL.createObjectURL(file));
    } else {
      setMediaType('image');
      const reader = new FileReader();
      reader.onload = () => setMediaUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    if (!mediaUrl) {
      setError('Please choose a photo or video first');
      return;
    }

    try {
      setIsPublishing(true);
      const story = await api.createStory({
        mediaType,
        mediaUrl,
        textOverlay,
        filterStyle
      });
      onStoryCreated(story);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create story');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-between p-4 max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between text-white z-20">
        <h3 className="text-sm font-bold flex items-center gap-1.5">
          <Sparkles size={16} className="text-sky-400" /> Create Story
        </h3>
        <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {error && <div className="text-xs text-red-500 bg-red-500/10 p-2.5 rounded-xl">{error}</div>}

      {/* Media Canvas / Preview */}
      <div className="relative flex-1 my-3 bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex items-center justify-center">
        {!mediaUrl ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-6 text-center cursor-pointer"
          >
            <Upload size={36} className="text-sky-500 mb-2" />
            <p className="text-xs font-bold text-neutral-200">Select Photo or Short Video</p>
            <p className="text-[10px] text-neutral-400 mt-1">Disappears in 24 hours</p>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {mediaType === 'image' ? (
              <img 
                src={mediaUrl} 
                alt="preview" 
                className={`max-h-full max-w-full object-contain ${filters.find(f => f.id === filterStyle)?.class || ''}`} 
              />
            ) : (
              <video 
                src={mediaUrl} 
                autoPlay 
                loop 
                muted 
                className={`max-h-full max-w-full object-contain ${filters.find(f => f.id === filterStyle)?.class || ''}`} 
              />
            )}

            {/* Text Overlay on Preview */}
            {textOverlay && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="inline-block bg-black/60 backdrop-blur-md text-white font-black text-sm px-3 py-1.5 rounded-xl shadow-lg">
                  {textOverlay}
                </span>
              </div>
            )}

            <button 
              onClick={() => setMediaUrl('')}
              className="absolute top-3 right-3 p-1.5 bg-black/70 text-white rounded-full hover:bg-black"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Overlay & Filter Controls */}
      {mediaUrl && (
        <div className="space-y-3 mb-2 z-20">
          {/* Text Overlay Input */}
          <div className="relative">
            <Type size={14} className="absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Add text overlay..."
              value={textOverlay}
              onChange={(e) => setTextOverlay(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs rounded-xl py-2 pl-9 pr-3 outline-none focus:border-sky-500"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilterStyle(f.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition shrink-0 ${
                  filterStyle === f.id
                    ? 'bg-sky-500 text-white'
                    : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Publish Button */}
      <button
        onClick={handlePublish}
        disabled={!mediaUrl || isPublishing}
        className="w-full bg-sky-500 disabled:opacity-40 text-white font-bold py-3 rounded-2xl text-xs hover:bg-sky-600 transition"
      >
        {isPublishing ? 'Sharing to Story...' : 'Share to Story (24h)'}
      </button>
    </div>
  );
}
