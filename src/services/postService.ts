import { Post, CreatePostDTO, User } from '../types';

const STORAGE_KEY = 'z_posts_db';

// Helper to extract #tags from text
export function extractHashtags(text: string): string[] {
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  return matches ? Array.from(new Set(matches.map(tag => tag.slice(1).toLowerCase()))) : [];
}

export const postService = {
  // Fetch timeline feed
  async getFeed(): Promise<Post[]> {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  // Create a new post (Text, Image, or Video)
  async createPost(user: User, dto: CreatePostDTO): Promise<Post> {
    const posts = await this.getFeed();

    const newPost: Post = {
      id: 'post_' + Date.now(),
      userId: user.id,
      authorName: user.displayName,
      authorUsername: user.username,
      authorAvatar: user.avatarUrl,
      type: dto.type,
      content: dto.content,
      mediaUrl: dto.mediaUrl?.trim() || undefined,
      hashtags: extractHashtags(dto.content),
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      createdAt: 'Just now'
    };

    const updated = [newPost, ...posts];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newPost;
  },

  // Toggle like
  async toggleLike(postId: string): Promise<Post[]> {
    const posts = await this.getFeed();
    const updated = posts.map(p => {
      if (p.id === postId) {
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1)
        };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
};