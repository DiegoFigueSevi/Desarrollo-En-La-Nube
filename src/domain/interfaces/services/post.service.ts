import { Timestamp } from 'firebase/firestore';

export interface Post {
  id?: string;
  uid: string;
  displayName: string;
  photoURL?: string;
  content: string;
  createdAt?: Timestamp | Date;
  imageURL?: string;
  imagePath?: string;   
}

export interface IPostService {
  createPost(post: Omit<Post, 'id' | 'createdAt'>): Promise<Post>;
  getPosts(): Promise<Post[]>;
  uploadImage(file: File, userId: string): Promise<{ url: string; path: string }>;
  deleteImage(path: string): Promise<void>;
}
