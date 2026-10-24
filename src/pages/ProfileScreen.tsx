import React, { useState, useRef } from 'react';
import { Camera, Edit3, LogOut, Grid } from 'lucide-react';
import { Post, User } from '../types';

export function EditProfileModal({ user, onSave, onClose }: any) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatarUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ displayName, username: username.toLowerCase(), bio, avatarUrl });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl">
        <h3 className="text-base font-bold mb-3">Edit Profile</h3>
        <div className="flex flex-col items-center mb-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-full border-2 border-dashed border-sky-500 cursor-pointer overflow-hidden relative group flex items-center justify-center bg-neutral-100 dark:bg-neutral-800"
          >
            {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <Camera size={24} className="text-sky-500" />}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-sky-500 mt-2 font-semibold">
            Choose picture from device
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <input 
            type="text" 
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-xs outline-none"
          />
          <input 
            type="text" 
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-xs outline-none"
          />
          <textarea 
            rows={2} 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Your bio..."
            className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-xs outline-none resize-none"
          />
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-neutral-700 text-xs">Cancel</button>
            <button type="submit" className="flex-1 py-2 rounded-lg bg-sky-500 text-white text-xs font-semibold">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProfileScreen({ user, posts = [], onUpdateUser, onLogout }: any) {
  const [showEdit, setShowEdit] = useState(false);
  const myPosts = (Array.isArray(posts) ? posts : []).filter((p: any) => p && p.userId === user?.id);

  return (
    <div className="p-4 space-y-4">
      {showEdit && <EditProfileModal user={user} onSave={onUpdateUser} onClose={() => setShowEdit(false)} />}

      <div className="flex items-start justify-between">
        <div className="w-16 h-16 rounded-full border-2 border-sky-500 overflow-hidden bg-neutral-800 flex items-center justify-center font-bold text-lg">
          {user?.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <span>{(user?.displayName || 'U').charAt(0).toUpperCase()}</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowEdit(true)} className="flex items-center gap-1 border border-neutral-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <Edit3 size={14} /> Edit
          </button>
          <button onClick={onLogout} className="p-1.5 border border-neutral-700 text-red-500 rounded-lg hover:bg-red-500/10">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold">{user?.displayName}</h2>
        <p className="text-xs text-neutral-400">@{user?.username}</p>
        <p className="text-xs mt-1 text-neutral-300">{user?.bio || 'No bio provided yet.'}</p>
      </div>

      <div className="flex justify-around border-y border-neutral-800 py-2.5 text-xs text-center">
        <div><span className="font-bold block text-sm">{myPosts.length}</span>Posts</div>
        <div><span className="font-bold block text-sm">{user?.followersCount || 0}</span>Followers</div>
        <div><span className="font-bold block text-sm">{(user?.followingIds || []).length}</span>Following</div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
          <Grid size={14} /> My Posts
        </div>
        {myPosts.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500">You haven't posted anything yet.</div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {myPosts.map((p: any) => (
              <div key={p.id} className="aspect-square bg-neutral-900 border border-neutral-800 overflow-hidden">
                {p.type === 'image' && p.mediaUrl ? (
                  <img src={p.mediaUrl} alt="grid item" className="w-full h-full object-cover" />
                ) : p.type === 'video' && (p.thumbnailUrl || p.mediaUrl) ? (
                  <img src={p.thumbnailUrl || p.mediaUrl} alt="grid thumb" className="w-full h-full object-cover" />
                ) : (
                  <div className="p-2 text-[10px] text-neutral-400 line-clamp-3">{p.content}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
