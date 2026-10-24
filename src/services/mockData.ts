import { User, Post } from '../types';

export const currentUser: User = {
  id: 'usr_1',
  username: 'neo',
  displayName: 'Neo Anderson',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
  verified: true
};

export const mockPosts: Post[] = [
  {
    id: 'post_1',
    type: 'text',
    author: currentUser,
    content: 'Building the new foundation of Z. Welcome to the hybrid era.',
    likes: 124,
    comments: 18,
    shares: 4,
    createdAt: '2m ago'
  }
];