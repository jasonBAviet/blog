export interface Post {
  slug: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  categoryName?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  views: number;
  reactions?: Record<string, number>;
  coverImage?: string;
  images?: string[];
}

export interface Category {
  slug: string;
  name: string;
  createdAt: string;
}

export interface Tag {
  name: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  postSlug: string;
  authorName: string;
  content: string;
  createdAt: string;
}
