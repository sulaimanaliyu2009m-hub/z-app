import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Image as ImageIcon, ArrowLeft, Users, Plus, 
  Search, Check, CheckCheck, Bell, MessageSquare, Heart, UserPlus, X 
} from 'lucide-react';
import type { User, Conversation, Message, NotificationItem } from '../types';
import { api } from '../services/api';
import { getSocket } from '../services/socket';

export function MessagesScreen({ currentUser }: { currentUser: User }) {
  const [activeTab, setActiveTab] = useState<'chats' | 'notifications'>('chats');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [typingUsers, setTypingUsers] = useState<{ [userId: string]: string }>({});
  
  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // New Chat Modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<any[]>([]);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const socket = getSocket();

  // Load conversations and notifications
  useEffect(() => {
    loadConversations();
    loadNotifications();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch {}
  };

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch {}
  };

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (msg: Message) => {
      if (activeConv && msg.conversationId === activeConv.id) {
        setMessages((prev) => [...prev, msg]);
        socket.emit('mark_read', { conversationId: activeConv.id });
      }
      loadConversations();
    });

    socket.on('user_typing', ({ conversationId, userId, username, isTyping }: any) => {
      if (activeConv && conversationId === activeConv.id && userId !== currentUser.id) {
        setTypingUsers((prev) => {
          const next = { ...prev };
          if (isTyping) next[userId] = username;
          else delete next[userId];
          return next;
        });
      }
    });

    socket.on('new_notification', (notif: NotificationItem) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('new_notification');
    };
  }, [socket, activeConv]);

  // Load messages when selecting a conversation
  useEffect(() => {
    if (!activeConv) return;
    socket?.emit('join_conversation', activeConv.id);

    api.getMessages(activeConv.id).then((msgs) => {
      setMessages(msgs);
      scrollToBottom();
    });

    return () => {
      socket?.emit('leave_conversation', activeConv.id);
    };
  }, [activeConv]);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!activeConv || !socket) return;

    socket.emit('typing', { conversationId: activeConv.id, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { conversationId: activeConv.id, isTyping: false });
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !imagePreview) || !activeConv || !socket) return;

    socket.emit('send_message', {
      conversationId: activeConv.id,
      text: inputText.trim(),
      imageUrl: imagePreview || undefined
    });

    setInputText('');
    setImagePreview('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('typing', { conversationId: activeConv.id, isTyping: false });
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSearchUsers = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const results = await api.searchUsers(q);
    setSearchResults(results);
  };

  const handleStartChat = async () => {
    if (selectedRecipients.length === 0) return;
    const recipientIds = selectedRecipients.map((r) => r.id);
    const conv = await api.createConversation(recipientIds, isGroupMode, groupTitle);
    
    setShowNewChatModal(false);
    setSelectedRecipients([]);
    setIsGroupMode(false);
    setGroupTitle('');
    await loadConversations();
    
    // Open new conversation
    const target = conversations.find(c => c.id === conv.id);
    if (target) setActiveConv(target);
    else loadConversations().then(() => setActiveConv(conv));
  };

  // If in an Active Chat View
  if (activeConv) {
    const otherMembers = (activeConv.members || []).filter((m) => m.id !== currentUser.id);
    const title = activeConv.isGroup
      ? activeConv.title || 'Group Chat'
      : otherMembers[0]?.displayName || otherMembers[0]?.username || 'Chat';

    const typingList = Object.values(typingUsers);

    return (
      <div className="flex flex-col h-[calc(100vh-120px)] bg-white dark:bg-black select-none">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <button onClick={() => { setActiveConv(null); loadConversations(); }} className="p-1 text-neutral-400 hover:text-white">
              <ArrowLeft size={18} />
            </button>
            <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs overflow-hidden">
              {activeConv.isGroup ? (
                <Users size={16} className="text-sky-500" />
              ) : otherMembers[0]?.avatarUrl ? (
                <img src={otherMembers[0].avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{title.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold leading-tight">{title}</h4>
              <p className="text-[10px] text-neutral-400">
                {activeConv.isGroup ? `${activeConv.members?.length || 0} members` : `@${otherMembers[0]?.username || 'user'}`}
              </p>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => {
            const isMe = m.senderId === currentUser.id;
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {activeConv.isGroup && !isMe && (
                  <span className="text-[10px] text-neutral-400 mb-0.5 ml-1">@{m.senderUsername}</span>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl p-3 text-xs shadow-sm ${
                    isMe
                      ? 'bg-sky-500 text-white rounded-br-none'
                      : 'bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-bl-none text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  {m.imageUrl && (
                    <img src={m.imageUrl} alt="attached" className="rounded-xl mb-1.5 max-h-52 w-full object-cover" />
                  )}
                  {m.text && <p className="leading-relaxed break-words">{m.text}</p>}
                </div>
                <span className="text-[9px] text-neutral-400 mt-1 flex items-center gap-1">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && <CheckCheck size={12} className="text-sky-400" />}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Banner */}
        {typingList.length > 0 && (
          <div className="px-4 py-1 text-[11px] text-sky-500 animate-pulse italic">
            {typingList.join(', ')} {typingList.length > 1 ? 'are' : 'is'} typing...
          </div>
        )}

        {/* Image Attachment Preview */}
        {imagePreview && (
          <div className="relative p-2 bg-neutral-900 border-t border-neutral-800 flex items-center">
            <img src={imagePreview} alt="upload preview" className="h-16 w-16 object-cover rounded-xl" />
            <button onClick={() => setImagePreview('')} className="absolute top-3 left-16 p-1 bg-black/80 rounded-full text-white">
              <X size={12} />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-neutral-400 hover:text-sky-500">
            <ImageIcon size={18} />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full px-4 py-2 text-xs outline-none focus:border-sky-500"
          />
          <button type="submit" disabled={!inputText.trim() && !imagePreview} className="bg-sky-500 disabled:opacity-40 text-white p-2 rounded-full">
            <Send size={15} />
          </button>
        </form>
      </div>
    );
  }

  // Conversation List & Notifications Main View
  return (
    <div className="p-4 space-y-4">
      {/* Top Tabs Switcher */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 pb-3 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'chats' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-neutral-500'
          }`}
        >
          <MessageSquare size={14} /> Messages
        </button>
        <button
          onClick={() => { setActiveTab('notifications'); api.markNotificationsRead(); }}
          className={`flex-1 pb-3 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'notifications' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-neutral-500'
          }`}
        >
          <Bell size={14} /> Notifications
          {notifications.filter(n => !n.isRead).length > 0 && (
            <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full">
              {notifications.filter(n => !n.isRead).length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'chats' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Conversations</h3>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="flex items-center gap-1 bg-sky-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-sky-600 transition"
            >
              <Plus size={14} /> New Chat
            </button>
          </div>

          {conversations.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              <MessageSquare size={36} className="mx-auto mb-2 text-neutral-600 stroke-1" />
              <p className="font-semibold text-neutral-300">No conversations yet</p>
              <p className="mt-1">Tap "+ New Chat" to message friends or start a group!</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {conversations.map((c) => {
                const other = (c.members || []).find((m) => m.id !== currentUser.id);
                const title = c.isGroup ? c.title || 'Group Chat' : other?.displayName || other?.username || 'Chat';

                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConv(c)}
                    className="py-3 flex items-center gap-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900/50 rounded-xl px-2 transition"
                  >
                    <div className="w-11 h-11 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                      {c.isGroup ? (
                        <Users size={18} className="text-sky-500" />
                      ) : other?.avatarUrl ? (
                        <img src={other.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{title.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold truncate">{title}</h4>
                        {c.lastMessage && (
                          <span className="text-[10px] text-neutral-400">
                            {new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {c.lastMessage ? (c.lastMessage.text || 'Photo attachment') : 'No messages yet'}
                      </p>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="bg-sky-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Notifications Tab */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Activity</h3>
            <button onClick={() => api.markNotificationsRead().then(loadNotifications)} className="text-[11px] text-sky-500 font-semibold hover:underline">
              Mark all as read
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              <Bell size={36} className="mx-auto mb-2 text-neutral-600 stroke-1" />
              <p className="font-semibold text-neutral-300">No notifications yet</p>
              <p className="mt-1">Likes, comments, followers, and message alerts appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {notifications.map((n) => (
                <div key={n.id} className={`py-3 flex items-center gap-3 ${n.isRead ? 'opacity-70' : 'font-semibold'}`}>
                  <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden font-bold text-xs">
                    {n.actorAvatar ? (
                      <img src={n.actorAvatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{(n.actorDisplayName || 'U').charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 text-xs">
                    <p>
                      <span className="font-bold text-sky-400">@{n.actorUsername}</span> {n.message}
                    </p>
                    <span className="text-[10px] text-neutral-400">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {n.type === 'like' && <Heart size={16} className="text-red-500 fill-red-500 shrink-0" />}
                  {n.type === 'comment' && <MessageSquare size={16} className="text-sky-400 shrink-0" />}
                  {n.type === 'follow' && <UserPlus size={16} className="text-green-400 shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Chat & Group Creator Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{isGroupMode ? 'Create Group Chat' : 'New Direct Message'}</h3>
              <button onClick={() => setShowNewChatModal(false)}><X size={18} /></button>
            </div>

            {/* Group Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsGroupMode(false)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border ${
                  !isGroupMode ? 'border-sky-500 bg-sky-500/10 text-sky-500' : 'border-neutral-800 text-neutral-400'
                }`}
              >
                1-on-1 DM
              </button>
              <button
                onClick={() => setIsGroupMode(true)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border ${
                  isGroupMode ? 'border-sky-500 bg-sky-500/10 text-sky-500' : 'border-neutral-800 text-neutral-400'
                }`}
              >
                Group Chat
              </button>
            </div>

            {isGroupMode && (
              <input
                type="text"
                placeholder="Group Name (e.g. Kali Creators)"
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-xs outline-none"
              />
            )}

            {/* Search User Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by username or name..."
                value={searchQuery}
                onChange={(e) => handleSearchUsers(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl py-2 pl-9 pr-3 text-xs outline-none"
              />
            </div>

            {/* Selected recipients pills */}
            {selectedRecipients.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedRecipients.map((r) => (
                  <span key={r.id} className="bg-sky-500 text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
                    @{r.username}
                    <button onClick={() => setSelectedRecipients(selectedRecipients.filter((x) => x.id !== r.id))}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search Results List */}
            <div className="max-h-40 overflow-y-auto divide-y divide-neutral-800">
              {searchResults.map((u) => {
                const isSelected = selectedRecipients.some((r) => r.id === u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      if (isGroupMode) {
                        setSelectedRecipients(isSelected ? selectedRecipients.filter((x) => x.id !== u.id) : [...selectedRecipients, u]);
                      } else {
                        setSelectedRecipients([u]);
                      }
                    }}
                    className="py-2 flex items-center justify-between cursor-pointer hover:bg-neutral-800/40 px-2 rounded-lg text-xs"
                  >
                    <div>
                      <h5 className="font-bold">{u.displayName}</h5>
                      <span className="text-[10px] text-neutral-400">@{u.username}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-sky-400" />}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleStartChat}
              disabled={selectedRecipients.length === 0}
              className="w-full bg-sky-500 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-sky-600 transition"
            >
              Start {isGroupMode ? 'Group Chat' : 'Conversation'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
