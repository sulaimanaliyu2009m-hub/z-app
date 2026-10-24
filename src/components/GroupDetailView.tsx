import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Users, Calendar, MessageSquare, Plus, Lock, Globe, 
  MapPin, Clock, ShieldCheck, ShieldAlert 
} from 'lucide-react';
import type { CommunityGroup, GroupMember, CommunityEvent, User } from '../types';
import { api } from '../services/api';

export function GroupDetailView({
  group,
  currentUser,
  onBack,
  onGroupUpdated
}: {
  group: CommunityGroup;
  currentUser: User;
  onBack: () => void;
  onGroupUpdated: () => void;
}) {
  const [tab, setTab] = useState<'feed' | 'events' | 'members'>('feed');
  const [isMember, setIsMember] = useState(group.isMember);
  const [memberRole, setMemberRole] = useState(group.myRole);
  const [memberCount, setMemberCount] = useState(group.memberCount);

  // Group Feed
  const [posts, setPosts] = useState<any[]>([]);
  const [postText, setPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Members
  const [members, setMembers] = useState<GroupMember[]>([]);

  // Events
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDesc, setEventDesc] = useState('');

  useEffect(() => {
    loadGroupFeed();
    loadMembers();
    loadEvents();
  }, [group.id]);

  const loadGroupFeed = async () => {
    const p = await api.getGroupPosts(group.id);
    setPosts(p);
  };

  const loadMembers = async () => {
    const m = await api.getGroupMembers(group.id);
    setMembers(m);
  };

  const loadEvents = async () => {
    const e = await api.getGroupEvents(group.id);
    setEvents(e);
  };

  const handleToggleJoin = async () => {
    const res = await api.toggleJoinGroup(group.id);
    if (res.joined) {
      setIsMember(true);
      setMemberRole('member');
      setMemberCount((c) => c + 1);
    } else {
      setIsMember(false);
      setMemberRole(undefined);
      setMemberCount((c) => Math.max(0, c - 1));
    }
    onGroupUpdated();
    loadMembers();
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) return;

    try {
      setIsPosting(true);
      const newPost = await api.createGroupPost(group.id, { content: postText.trim() });
      setPosts([newPost, ...posts]);
      setPostText('');
    } finally {
      setIsPosting(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate || !eventLocation.trim()) return;

    const newEv = await api.createGroupEvent(group.id, {
      title: eventTitle.trim(),
      description: eventDesc.trim(),
      eventDate,
      location: eventLocation.trim()
    });
    setEvents([...events, newEv]);
    setShowEventModal(false);
    setEventTitle('');
    setEventDate('');
    setEventLocation('');
    setEventDesc('');
  };

  const handleRsvp = async (eventId: string, status: 'going' | 'interested') => {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;

    const nextStatus = ev.myRsvp === status ? 'not_going' : status;
    await api.rsvpEvent(eventId, nextStatus as any);
    loadEvents();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 select-none pb-20">
      {/* Cover Header */}
      <div className="relative h-44 bg-neutral-800">
        {group.coverImageUrl ? (
          <img src={group.coverImageUrl} alt="cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-sky-900 via-neutral-900 to-purple-900 flex items-center justify-center">
            <Users size={48} className="text-white/20" />
          </div>
        )}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-black/60 backdrop-blur rounded-full text-white hover:bg-black"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      {/* Info Card */}
      <div className="p-4 space-y-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              {group.name}
              {group.isPrivate ? (
                <Lock size={14} className="text-neutral-400" />
              ) : (
                <Globe size={14} className="text-neutral-400" />
              )}
            </h2>
            <p className="text-xs text-neutral-400 capitalize">
              {group.isPrivate ? 'Private' : 'Public'} Community · {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </p>
          </div>

          <button
            onClick={handleToggleJoin}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              isMember
                ? 'border border-neutral-700 text-neutral-300 hover:text-red-500 hover:border-red-500'
                : 'bg-sky-500 text-white hover:bg-sky-600'
            }`}
          >
            {isMember ? (memberRole === 'admin' ? 'Admin' : 'Joined') : '+ Join Community'}
          </button>
        </div>

        {group.description && (
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">{group.description}</p>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 pt-2 text-xs font-bold">
          <button
            onClick={() => setTab('feed')}
            className={`flex-1 pb-2.5 transition flex items-center justify-center gap-1.5 ${
              tab === 'feed' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-neutral-500'
            }`}
          >
            <MessageSquare size={14} /> Group Feed
          </button>
          <button
            onClick={() => setTab('events')}
            className={`flex-1 pb-2.5 transition flex items-center justify-center gap-1.5 ${
              tab === 'events' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-neutral-500'
            }`}
          >
            <Calendar size={14} /> Events ({events.length})
          </button>
          <button
            onClick={() => setTab('members')}
            className={`flex-1 pb-2.5 transition flex items-center justify-center gap-1.5 ${
              tab === 'members' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-neutral-500'
            }`}
          >
            <Users size={14} /> Members ({members.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Group Feed */}
      {tab === 'feed' && (
        <div className="p-4 space-y-4">
          {isMember ? (
            <form onSubmit={handleCreatePost} className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-2">
              <textarea
                rows={2}
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder={`Post something in ${group.name}...`}
                className="w-full bg-transparent text-xs outline-none resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!postText.trim() || isPosting}
                  className="bg-sky-500 disabled:opacity-40 text-white text-xs font-bold px-4 py-1.5 rounded-full"
                >
                  {isPosting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 text-center text-xs text-neutral-500 border border-neutral-800 rounded-xl">
              Join this community to post and interact with members.
            </div>
          )}

          {posts.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">No posts in this group yet. Be the first to share!</div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {posts.map((p) => (
                <article key={p.id} className="py-3 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs overflow-hidden">
                      {p.authorAvatar ? <img src={p.authorAvatar} alt="avatar" className="w-full h-full object-cover" /> : <span>{(p.authorName || 'U').charAt(0)}</span>}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{p.authorName}</h4>
                      <p className="text-[10px] text-neutral-400">@{p.authorUsername} · {new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed">{p.content}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Group Events & RSVPs */}
      {tab === 'events' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Upcoming Events</h3>
            {isMember && (
              <button
                onClick={() => setShowEventModal(true)}
                className="flex items-center gap-1 bg-sky-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-sky-600"
              >
                <Plus size={14} /> Create Event
              </button>
            )}
          </div>

          {events.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">No events scheduled for this group.</div>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev.id} className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-3">
                  <div>
                    <h4 className="text-sm font-bold">{ev.title}</h4>
                    {ev.description && <p className="text-xs text-neutral-400 mt-1">{ev.description}</p>}
                  </div>

                  <div className="space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-sky-500" />
                      <span>{new Date(ev.eventDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-sky-500" />
                      <span>{ev.location}</span>
                    </div>
                  </div>

                  {/* RSVP Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="text-[11px] text-neutral-400">
                      <span className="font-bold text-sky-400">{ev.goingCount}</span> Going · <span className="font-bold">{ev.interestedCount}</span> Interested
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRsvp(ev.id, 'going')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                          ev.myRsvp === 'going'
                            ? 'bg-green-500 text-white'
                            : 'border border-neutral-700 text-neutral-400 hover:text-green-400'
                        }`}
                      >
                        ✓ Going
                      </button>
                      <button
                        onClick={() => handleRsvp(ev.id, 'interested')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                          ev.myRsvp === 'interested'
                            ? 'bg-amber-500 text-white'
                            : 'border border-neutral-700 text-neutral-400 hover:text-amber-400'
                        }`}
                      >
                        ★ Interested
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Group Members & Roles */}
      {tab === 'members' && (
        <div className="p-4 space-y-2 divide-y divide-neutral-200 dark:border-neutral-800">
          {members.map((m) => (
            <div key={m.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs overflow-hidden">
                  {m.avatarUrl ? <img src={m.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <span>{m.displayName.charAt(0)}</span>}
                </div>
                <div>
                  <h4 className="text-xs font-bold">{m.displayName}</h4>
                  <p className="text-[10px] text-neutral-400">@{m.username}</p>
                </div>
              </div>

              {m.role === 'admin' && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <ShieldAlert size={12} /> Admin
                </span>
              )}
              {m.role === 'moderator' && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <ShieldCheck size={12} /> Moderator
                </span>
              )}
              {m.role === 'member' && (
                <span className="text-[10px] text-neutral-500">Member</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateEvent} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold">Create Group Event</h3>
            <input
              type="text"
              placeholder="Event Title (e.g. Kali CTF Meetup)"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-xs outline-none"
              required
            />
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-xs outline-none text-white"
              required
            />
            <input
              type="text"
              placeholder="Location (e.g. Discord, Online, or Campus)"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-xs outline-none"
              required
            />
            <textarea
              rows={2}
              placeholder="Event Description..."
              value={eventDesc}
              onChange={(e) => setEventDesc(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-xs outline-none resize-none"
            />
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowEventModal(false)} className="flex-1 py-2 rounded-lg border border-neutral-700 text-xs">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2 rounded-lg bg-sky-500 text-white font-bold text-xs hover:bg-sky-600">
                Publish Event
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
