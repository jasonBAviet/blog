export interface Post {
  slug: string;
  title: string;
  content: string;
  category: string;
  categoryName?: string;
  createdAt: string;
  updatedAt?: string;
  views: number;
  coverImage?: string;
  images?: string[];
}

export interface Category {
  slug: string;
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
