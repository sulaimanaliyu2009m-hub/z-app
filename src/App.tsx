import { UserProfilePage } from "./pages/UserProfilePage";
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import { 
  Home as HomeIcon, Compass, PlusSquare, MessageSquare, User as UserIcon, 
  Bot, Sun, Moon, Sparkles, AlertCircle, Radio, Loader2, X 
} from 'lucide-react';

import type { Post, User } from './types';
import { INTERESTS_LIST } from './types';
import { api } from './services/api';
import { getSocket } from './services/socket';

import { CommentsModal } from './components/CommentsModal';
import { ShareModal } from './components/ShareModal';

import { FlowFeed } from './pages/FlowFeed';
import { ForYouFeed } from './pages/ForYouFeed';
import { LiveFeedScreen } from './pages/LiveFeedScreen';
import { CreateScreen } from './pages/CreateScreen';
import { DiscoverScreen } from './pages/DiscoverScreen';
import { MessagesScreen } from './pages/MessagesScreen';
import { AiAssistantScreen } from './pages/AiAssistantScreen';
import { ProfileScreen } from './pages/ProfileScreen';
import { UserProfileScreen } from './pages/UserProfileScreen';
import { EditProfileScreen } from './pages/EditProfileScreen';
import { PrivacyPolicyScreen, TermsOfServiceScreen } from './pages/LegalPages';

function AuthScreen({ onSuccess }: { onSuccess: (user: User, token: string) => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWakingNotice, setShowWakingNotice] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const wakingTimerRef = useRef<any>(null);

  useEffect(() => {
    api.pingServer();
  }, []);

  const handleCancel = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setLoading(false);
    setShowWakingNotice(false);
    if (wakingTimerRef.current) clearTimeout(wakingTimerRef.current);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setShowWakingNotice(false);

    wakingTimerRef.current = setTimeout(() => {
      setShowWakingNotice(true);
    }, 4000);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (isSignUp) {
        const data = await api.register(
          { email, password, username, displayName: displayName || username },
          controller.signal
        );
        onSuccess(data.user, data.token);
      } else {
        const data = await api.login({ email, password }, controller.signal);
        onSuccess(data.user, data.token);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Authentication error.');
      }
    } finally {
      setLoading(false);
      setShowWakingNotice(false);
      if (wakingTimerRef.current) clearTimeout(wakingTimerRef.current);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white flex flex-col justify-center px-6 max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black tracking-tighter mb-2">Z<span className="text-sky-500">.</span></h1>
        <p className="text-xs text-neutral-500">{isSignUp ? 'Create your new account.' : 'Log in to your account.'}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={14} /> <span>{error}</span>
        </div>
      )}

      {showWakingNotice && (
        <div className="mb-4 p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl text-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            <span>Waking up the server, this can take up to a minute...</span>
          </div>
          <button onClick={handleCancel} className="text-neutral-400 hover:text-white text-[11px] font-bold underline">
            Cancel
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <>
            <div>
              <label className="text-xs font-semibold text-neutral-400 block mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-400 block mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display Name"
                className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-sky-500"
              />
            </div>
          </>
        )}
        <div>
          <label className="text-xs font-semibold text-neutral-400 block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-sky-500"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-400 block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-sky-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition hover:bg-sky-600 mt-2 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          <span>{loading ? (showWakingNotice ? 'Connecting to cloud...' : 'Please wait...') : (isSignUp ? 'Sign Up' : 'Log In')}</span>
        </button>
      </form>

      <div className="flex justify-center gap-4 text-[10px] text-neutral-500 mt-8">
        <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
        <span>·</span>
        <Link to="/terms" className="hover:underline">Terms of Service</Link>
      </div>

      <p className="text-center text-xs text-neutral-500 mt-4">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-sky-500 font-bold hover:underline">
          {isSignUp ? 'Log In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
}

function OnboardingScreen({ onComplete }: { onComplete: (interests: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (t: string) => setSelected(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white flex flex-col justify-between p-6 max-w-md mx-auto">
      <div>
        <h2 className="text-2xl font-black mb-1">Pick your interests</h2>
        <p className="text-xs text-neutral-400 mb-6">Choose at least 3 topics to personalize your feed.</p>
        <div className="flex flex-wrap gap-2">
          {INTERESTS_LIST.map(topic => (
            <button
              key={topic}
              onClick={() => toggle(topic)}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition ${
                selected.includes(topic) ? 'bg-sky-500 border-sky-500 text-white' : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={() => onComplete(selected)}
        disabled={selected.length < 3}
        className="w-full bg-sky-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl text-sm"
      >
        Continue ({selected.length}/3 selected)
      </button>
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useState(true);
  const [feedMode, setFeedMode] = useState<'flow' | 'live' | 'following' | 'foryou'>('flow');

  const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);
  const [activeSharePost, setActiveSharePost] = useState<Post | null>(null);
  const [unreadBadgeCount, setUnreadBadgeCount] = useState(0);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem('z_user_account');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const [onboarding, setOnboarding] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  const loadFeed = async () => {
    try {
      const realPosts = await api.getFeed();
      setPosts(realPosts);
    } catch (err) {
      console.warn('Could not load feed', err);
    }
  };

  const loadBadges = async () => {
    try {
      const [convs, notifs] = await Promise.all([api.getConversations(), api.getNotifications()]);
      const unreadConvs = Array.isArray(convs) ? convs.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0) : 0;
      const unreadNotifs = Array.isArray(notifs) ? notifs.filter((n: any) => !n.isRead).length : 0;
      setUnreadBadgeCount(unreadConvs + unreadNotifs);
    } catch {}
  };

  useEffect(() => {
    if (currentUser) {
      loadFeed();
      loadBadges();

      const socket = getSocket();
      socket?.on('new_notification', () => setUnreadBadgeCount((prev) => prev + 1));
      socket?.on('new_message', () => setUnreadBadgeCount((prev) => prev + 1));

      return () => {
        socket?.off('new_notification');
        socket?.off('new_message');
      };
    } else {
      api.pingServer();
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeCommentPost) {
      const found = posts.find(p => p.id === activeCommentPost.id);
      if (found) setActiveCommentPost(found);
    }
  }, [posts]);

  const handleAuthSuccess = (u: User, token: string) => {
    localStorage.setItem('z_token', token);
    localStorage.setItem('z_user_account', JSON.stringify(u));
    setCurrentUser(u);
    setOnboarding(true);
  };

  const handleOnboardingComplete = (interests: string[]) => {
    if (!currentUser) return;
    const updated = { ...currentUser, interests };
    localStorage.setItem('z_user_account', JSON.stringify(updated));
    setCurrentUser(updated);
    setOnboarding(false);
  };

  const handlePostCreated = (post: Post) => {
    setPosts(prev => [post, ...prev]);
  };

  const handleLike = async (id: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          likesCount: isLiked ? (p.likesCount || 0) + 1 : Math.max(0, (p.likesCount || 0) - 1),
        };
      }
      return p;
    }));
    await api.toggleLike(id);
  };

  const handleToggleFollow = async (targetUserId: string) => {
    if (!currentUser || targetUserId === currentUser.id) return;
    const following = currentUser.followingIds || [];
    const isFollowing = following.includes(targetUserId);
    const updated = isFollowing ? following.filter(id => id !== targetUserId) : [...following, targetUserId];

    const updatedUser = { ...currentUser, followingIds: updated, followingCount: updated.length };
    setCurrentUser(updatedUser);
    localStorage.setItem('z_user_account', JSON.stringify(updatedUser));
    await api.toggleFollow(targetUserId);
  };

  const handleAddComment = async (postId: string, text: string, parentId?: string) => {
    if (!currentUser) return;
    const comment = await api.addComment(postId, text, parentId);
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...(p.comments || []), comment] };
      }
      return p;
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('z_token');
    localStorage.removeItem('z_user_account');
    setCurrentUser(null);
  };

  if (!currentUser) {
    return (
      <BrowserRouter>
        <div className={dark ? 'dark' : ''}>
          <Routes>
          <Route path="/u/:username" element={<UserProfilePage />} />
            <Route path="/privacy" element={<PrivacyPolicyScreen />} />
            <Route path="/terms" element={<TermsOfServiceScreen />} />
            <Route path="*" element={<AuthScreen onSuccess={handleAuthSuccess} />} />
          </Routes>
        </div>
      </BrowserRouter>
    );
  }

  if (onboarding) {
    return <div className={dark ? 'dark' : ''}><OnboardingScreen onComplete={handleOnboardingComplete} /></div>;
  }

  return (
    <BrowserRouter>
      <div className={dark ? 'dark' : ''}>
        <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 flex flex-col relative pb-16">
          
          <header className="sticky top-0 z-30 h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/80 backdrop-blur flex items-center justify-between px-4 max-w-4xl mx-auto w-full">
            <Link to="/" className="text-2xl font-black tracking-tighter">
              Z<span className="text-sky-500">.</span>
            </Link>

            <div className="flex items-center gap-3 text-xs font-bold">
              <button onClick={() => setFeedMode('flow')} className={`transition ${feedMode === 'flow' ? 'text-sky-500 border-b-2 border-sky-500 pb-0.5' : 'text-neutral-500'}`}>
                Feed
              </button>
              <button onClick={() => setFeedMode('live')} className={`transition flex items-center gap-1 ${feedMode === 'live' ? 'text-sky-500 border-b-2 border-sky-500 pb-0.5' : 'text-neutral-500'}`}>
                <Radio size={13} className="text-red-500 animate-pulse" /> Live
              </button>
              <button onClick={() => setFeedMode('following')} className={`transition ${feedMode === 'following' ? 'text-sky-500 border-b-2 border-sky-500 pb-0.5' : 'text-neutral-500'}`}>
                Following
              </button>
              <button onClick={() => setFeedMode('foryou')} className={`flex items-center gap-1 transition ${feedMode === 'foryou' ? 'text-sky-500 border-b-2 border-sky-500 pb-0.5' : 'text-neutral-500'}`}>
                <Sparkles size={12} className="text-sky-400" /> For You
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <Link to="/ai" className="flex items-center gap-1 bg-sky-500/10 text-sky-500 px-3 py-1 rounded-full text-xs font-semibold hover:bg-sky-500/20">
                <Bot size={15} /> <span>Ask Z</span>
              </Link>
              <button onClick={() => setDark(!dark)} className="p-2 rounded-full hover:bg-neutral-800 text-neutral-500 transition">
                {dark ? <Sun size={18}/> : <Moon size={18}/>}
              </button>
            </div>
          </header>

          <main className="flex-1 w-full max-w-4xl mx-auto flex justify-center">
            <Routes>
              <Route path="/" element={
                feedMode === 'live' ? (
                  <LiveFeedScreen currentUser={currentUser} onOpenComments={(p: Post) => setActiveCommentPost(p)} onOpenShare={(p: Post) => setActiveSharePost(p)} />
                ) : feedMode === 'foryou' ? (
                  <ForYouFeed posts={posts} currentUser={currentUser} onToggleLike={handleLike} onToggleFollow={handleToggleFollow} onOpenComments={(p: Post) => setActiveCommentPost(p)} onOpenShare={(p: Post) => setActiveSharePost(p)} />
                ) : (
                  <FlowFeed posts={posts} currentUser={currentUser} isFollowingTab={feedMode === 'following'} onToggleLike={handleLike} onToggleFollow={handleToggleFollow} onOpenComments={(p: Post) => setActiveCommentPost(p)} onOpenShare={(p: Post) => setActiveSharePost(p)} />
                )
              } />
              <Route path="/discover" element={<DiscoverScreen user={currentUser} />} />
              <Route path="/create" element={<CreateScreen onPostCreated={handlePostCreated} />} />
              <Route path="/messages" element={<MessagesScreen currentUser={currentUser} />} />
              <Route path="/profile" element={<ProfileScreen user={currentUser} posts={posts} onUpdateUser={(up: any) => setCurrentUser({ ...currentUser, ...up })} onLogout={handleLogout} />} />
              <Route path="/u/:username" element={<UserProfileScreen currentUser={currentUser} />} />
              <Route path="/profile/edit" element={<EditProfileScreen currentUser={currentUser} onUpdate={(u) => setCurrentUser(u)} />} />
              <Route path="/ai" element={<AiAssistantScreen />} />
              <Route path="/privacy" element={<PrivacyPolicyScreen />} />
              <Route path="/terms" element={<TermsOfServiceScreen />} />
            </Routes>
          </main>

          {activeCommentPost && <CommentsModal post={activeCommentPost} onClose={() => setActiveCommentPost(null)} onAddComment={handleAddComment} />}
          {activeSharePost && <ShareModal post={activeSharePost} onClose={() => setActiveSharePost(null)} />}

          <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-16 bg-white/95 dark:bg-black/95 backdrop-blur border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-around z-30">
            <NavLink to="/" className={({isActive}) => isActive ? "text-sky-500 flex flex-col items-center" : "text-neutral-500 flex flex-col items-center"}><HomeIcon size={20} /><span className="text-[10px] mt-0.5">Home</span></NavLink>
            <NavLink to="/discover" className={({isActive}) => isActive ? "text-sky-500 flex flex-col items-center" : "text-neutral-500 flex flex-col items-center"}><Compass size={20} /><span className="text-[10px] mt-0.5">Discover</span></NavLink>
            <NavLink to="/create" className={({isActive}) => isActive ? "text-sky-500 flex flex-col items-center" : "text-neutral-500 flex flex-col items-center"}><PlusSquare size={20} /><span className="text-[10px] mt-0.5">Create</span></NavLink>
            <NavLink to="/messages" className={({isActive}) => isActive ? "text-sky-500 flex flex-col items-center relative" : "text-neutral-500 flex flex-col items-center relative"}>
              <div className="relative">
                <MessageSquare size={20} />
                {unreadBadgeCount > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">{unreadBadgeCount > 99 ? '99+' : unreadBadgeCount}</span>}
              </div>
              <span className="text-[10px] mt-0.5">Messages</span>
            </NavLink>
            <NavLink to="/profile" className={({isActive}) => isActive ? "text-sky-500 flex flex-col items-center" : "text-neutral-500 flex flex-col items-center"}><UserIcon size={20} /><span className="text-[10px] mt-0.5">Profile</span></NavLink>
          </nav>
        </div>
      </div>
    </BrowserRouter>
  );
}
