import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from '../firebase/firebase.config';
import type { IPostService, Post } from '../../domain/interfaces/services/post.service';

type FirestorePost = Omit<Post, 'id' | 'createdAt'> & {
  createdAt: Timestamp;
};

export class FirebasePostRepository implements IPostService {
  private readonly postsCollection = collection(db, 'posts');
  private readonly storage = getStorage();

  async createPost(post: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
    try {
      const postData = {
        uid: post.uid,
        displayName: post.displayName,
        content: post.content,
        createdAt: serverTimestamp(),
        ...(post.photoURL && { photoURL: post.photoURL })
      };

      const docRef = await addDoc(this.postsCollection, postData);
      
      return {
        ...post,
        id: docRef.id,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Error al crear el post');
    }
  }

  async getPosts(): Promise<Post[]> {
    try {
      const q = query(this.postsCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: data.uid,
          displayName: data.displayName,
          content: data.content,
          photoURL: data.photoURL,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Post;
      });
    } catch (error) {
      console.error('Error getting posts:', error);
      throw new Error('Error al obtener los posts');
    }
  }

  async uploadImage(file: File, userId: string): Promise<{ url: string; path: string }> {
    try {
      const storagePath = `posts/${userId}/${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, storagePath);
      
      const snapshot = await uploadBytes(storageRef, file);
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: storagePath
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Error al subir la imagen');
    }
  }

  async deleteImage(path: string): Promise<void> {
    try {
      if (!path) return;
      
      const imageRef = ref(this.storage, path);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Error al eliminar la imagen');
    }
  }
}

export const postRepository = new FirebasePostRepository();
