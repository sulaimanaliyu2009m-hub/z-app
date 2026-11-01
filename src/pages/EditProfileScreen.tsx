import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { User } from '../types';

export function EditProfileScreen({ currentUser, onUpdate }: { currentUser: User; onUpdate: (u: User) => void }) {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [bio, setBio] = useState(currentUser.bio);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await api.updateProfile({ displayName, bio });
    onUpdate(updated.user);
    navigate('/profile');
  };

  return (
    <form onSubmit={handleSave} className="p-6 space-y-4">
      <input className="w-full p-3 border rounded-xl" value={displayName} onChange={e => setDisplayName(e.target.value)} />
      <textarea className="w-full p-3 border rounded-xl" value={bio} onChange={e => setBio(e.target.value)} />
      <button className="w-full bg-sky-500 p-3 rounded-xl text-white font-bold">Save Changes</button>
    </form>
  );
}
