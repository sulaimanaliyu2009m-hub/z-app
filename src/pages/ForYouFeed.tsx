import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Plus, Check, Volume2, VolumeX, Music, Play, Pause, Video as VideoIcon } from 'lucide-react';
import { extractHashtags } from '../types';
import { api } from '../services/api';

export function TikTokVideoCard({
  post,
  isActive,
  isMuted,
  isFollowing,
  onToggleMute,
  onToggleLike,
  onToggleFollow,
  onOpenComments,
  onOpenShare
}: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const clickTimerRef = useRef<any>(null);

  // Track watch time for the recommendation engine
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      startTimeRef.current = Date.now();
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      // Record watch time when scrolled away
      if (startTimeRef.current > 0 && video.duration) {
        const watchedSecs = (Date.now() - startTimeRef.current) / 1000;
        const completionRate = Math.min(video.currentTime / video.duration, 1.0);
        api.trackWatchTime(post.id, watchedSecs, completionRate);
        startTimeRef.current = 0;
      }
      video.pause();
      setIsPlaying(false);
      setProgress(0);
    }
  }, [isActive, post.id]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const handleScreenTap = () => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      if (!post.isLiked) onToggleLike(post.id);
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 800);
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        if (videoRef.current) {
          if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
          setShowPlayIcon(true);
          setTimeout(() => setShowPlayIcon(false), 500);
        }
      }, 260);
    }
  };

  const hashtags = extractHashtags(post?.content || '');

  return (
    <div className="relative h-full w-full snap-start snap-always overflow-hidden bg-black flex items-center justify-center select-none">
      <video
        ref={videoRef}
        src={post.mediaUrl}
        poster={post.thumbnailUrl}
        loop
        playsInline
        muted={isMuted}
        onTimeUpdate={() => {
          if (videoRef.current && videoRef.current.duration) {
            setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
          }
        }}
        className="h-full w-full object-cover"
        onClick={handleScreenTap}
        preload="auto"
      />

      {showHeartPop && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <Heart size={110} className="text-red-500 fill-red-500 animate-ping opacity-90 drop-shadow-2xl" />
        </div>
      )}

      {showPlayIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-black/50 p-4 rounded-full text-white backdrop-blur-md">
            {isPlaying ? <Play size={36} fill="white" /> : <Pause size={36} fill="white" />}
          </div>
        </div>
      )}

      <button onClick={onToggleMute} className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md p-2 rounded-full text-white">
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <div className="absolute right-3 bottom-14 z-20 flex flex-col items-center gap-5 text-white">
        <div className="relative flex flex-col items-center">
          <div className="w-11 h-11 rounded-full border-2 border-white overflow-hidden bg-neutral-800 flex items-center justify-center font-bold text-xs">
            {post.authorAvatar ? <img src={post.authorAvatar} alt="avatar" className="w-full h-full object-cover" /> : <span>{(post.authorName || 'U').charAt(0).toUpperCase()}</span>}
          </div>
          <button 
            onClick={() => onToggleFollow(post.userId)}
            className={`absolute -bottom-2 w-5 h-5 rounded-full flex items-center justify-center text-white transition ${isFollowing ? 'bg-neutral-600' : 'bg-red-500'}`}
          >
            {isFollowing ? <Check size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={3} />}
          </button>
        </div>

        <div className="flex flex-col items-center">
          <button onClick={() => onToggleLike(post.id)} className="p-1 active:scale-125 transition">
            <Heart size={32} className={`drop-shadow-md ${post.isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
          </button>
          <span className="text-[11px] font-bold drop-shadow">{post.likesCount || 0}</span>
        </div>

        <div className="flex flex-col items-center">
          <button onClick={() => onOpenComments(post)} className="p-1 active:scale-125 transition">
            <MessageCircle size={30} className="text-white drop-shadow-md" />
          </button>
          <span className="text-[11px] font-bold drop-shadow">{(post.comments || []).length}</span>
        </div>

        <div className="flex flex-col items-center">
          <button onClick={() => onOpenShare(post)} className="p-1 active:scale-125 transition">
            <Share2 size={28} className="text-white drop-shadow-md" />
          </button>
        </div>

        <div className="w-10 h-10 rounded-full border-2 border-neutral-700 bg-neutral-900 flex items-center justify-center animate-spin">
          <Music size={16} className="text-sky-400" />
        </div>
      </div>

      <div className="absolute left-0 right-16 bottom-3 z-20 px-4 text-white drop-shadow-md">
        <h3 className="font-bold text-sm tracking-wide">@{post.authorUsername}</h3>
        <p className="text-xs text-neutral-100 leading-relaxed mt-1 line-clamp-2">{post.content}</p>
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 my-1.5">
            {hashtags.map((t: string) => <span key={t} className="text-[11px] font-bold text-sky-400">#{t}</span>)}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
        <div className="h-full bg-sky-500 transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function ForYouFeed({ posts = [], currentUser, onToggleLike, onToggleFollow, onOpenComments, onOpenShare }: any) {
  const [rankedPosts, setRankedPosts] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load AI-ranked feed from recommendation service (with fallback)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await api.getForYouRankedFeed();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setRankedPosts(data);
          return;
        }
      } catch {}

      // Default to general posts if empty
      if (isMounted) {
        const fallback = (Array.isArray(posts) ? posts : []).filter((p: any) => p && p.type === 'video' && p.mediaUrl);
        setRankedPosts(fallback);
      }
    })();

    return () => { isMounted = false; };
  }, [posts]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.getAttribute('data-index'));
          setActiveIndex(idx);
        }
      });
    }, { root: containerRef.current, threshold: 0.65 });

    itemRefs.current.forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [rankedPosts]);

  if (rankedPosts.length === 0) {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center text-center p-6 text-neutral-500">
        <VideoIcon size={44} className="mb-2 text-sky-500" />
        <h3 className="font-bold text-sm text-neutral-200">No Reels Yet</h3>
        <p className="text-xs text-neutral-400 mt-1">Upload a 60-second video in Create (+) to rank it here!</p>
      </div>
    );
  }

  const followingIds = Array.isArray(currentUser?.followingIds) ? currentUser.followingIds : [];

  return (
    <div className="relative h-[calc(100vh-120px)] w-full bg-black">
      <div ref={containerRef} className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
        {rankedPosts.map((post: any, idx: number) => (
          <div key={post.id} ref={el => itemRefs.current[idx] = el} data-index={idx} className="h-full w-full snap-start snap-always">
            <TikTokVideoCard
              post={post}
              isActive={idx === activeIndex}
              isMuted={isMuted}
              isFollowing={followingIds.includes(post.userId)}
              onToggleMute={() => setIsMuted(!isMuted)}
              onToggleLike={onToggleLike}
              onToggleFollow={onToggleFollow}
              onOpenComments={onOpenComments}
              onOpenShare={onOpenShare}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
