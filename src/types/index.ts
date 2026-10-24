export type PostType = 'text' | 'image' | 'video';

export interface CommentReply {
  id: string;
  username: string;
  text: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  username: string;
  text: string;
  createdAt: string;
  replies?: CommentReply[];
}

export interface Post {
  id: string;
  userId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  type: PostType;
  content: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  hashtags: string[];
  likesCount: number;
  comments: Comment[];
  isLiked: boolean;
  isReposted?: boolean;
  repostsCount?: number;
  quoteOfId?: string;
  quotedPost?: {
    id: string;
    content: string;
    createdAt: string;
    authorName: string;
    authorUsername: string;
    authorAvatar: string;
  } | null;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  followingIds: string[];
  interests: string[];
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  textOverlay?: string;
  filterStyle?: string;
  createdAt: string;
  expiresAt: string;
}

export interface UserStoriesGroup {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  stories: Story[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  senderDisplayName: string;
  senderAvatar: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  title?: string;
  members: { id: string; username: string; displayName: string; avatarUrl: string }[];
  lastMessage?: { id: string; text: string; imageUrl?: string; senderId: string; createdAt: string };
  unreadCount: number;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'message';
  entityId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actorUsername: string;
  actorDisplayName: string;
  actorAvatar: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string;
  isPrivate: boolean;
  memberCount: number;
  isMember: boolean;
  myRole?: 'admin' | 'moderator' | 'member';
  createdAt: string;
}

export interface GroupMember {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
}

export interface CommunityEvent {
  id: string;
  groupId: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  goingCount: number;
  interestedCount: number;
  myRsvp?: 'going' | 'interested' | 'not_going' | null;
  createdAt: string;
}

export interface TrendingTopic {
  tag: string;
  count: number;
}

export interface SearchResults {
  people: { id: string; username: string; displayName: string; avatarUrl: string; bio: string; isFollowing?: boolean }[];
  posts: Post[];
  hashtags: { tag: string; postCount: number }[];
}

// AI Feature Models
export interface AiCaptionResponse {
  captions: string[];
  hashtags: string[];
}

export interface AiSummaryResponse {
  summary: string;
  keyTakeaways: string[];
}

export const INTERESTS_LIST = [
  'Artificial Intelligence', 'Cybersecurity', 'Web Development', 
  'Linux & Kali', 'Mobile Apps', 'UI/UX Design', 
  'Gaming', 'Crypto & Web3', 'Robotics', 'Cloud Tech'
];

export function extractHashtags(text?: string): string[] {
  if (!text || typeof text !== 'string') return [];
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  return matches ? Array.from(new Set(matches.map(t => t.slice(1).toLowerCase()))) : [];
}

// Runtime symbols to guarantee Vite/Rolldown builds cleanly
export const Post = {};
export const User = {};
export const Comment = {};
export const CommentReply = {};
export const PostType = {};
export const Story = {};
export const UserStoriesGroup = {};
export const Message = {};
export const Conversation = {};
export const NotificationItem = {};
export const CommunityGroup = {};
export const GroupMember = {};
export const CommunityEvent = {};
export const TrendingTopic = {};
export const SearchResults = {};
export const AiCaptionResponse = {};
export const AiSummaryResponse = {};
