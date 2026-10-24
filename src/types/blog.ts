export interface Post {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  content: string;
  author: string;
  authorEmail: string;
  authorAvatar?: string;
  coverImage?: string;
  tags: string[];
  status: 'draft' | 'published';
  publishedAt: string;
  updatedAt: string;
  likesCount: number;
  readTimeMinutes: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  comment: string;
  createdAt: string;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export interface BlogSettings {
  publicationName: string;
  publicationTagline: string;
  authorName: string;
  authorBio: string;
  authorAvatar: string;
  spreadsheetId: string;
  appsScriptUrl: string;
  backendMode: 'apps-script' | 'public-sheet' | 'local';
}
