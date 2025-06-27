import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import type { IPostService, Post } from '../../domain/interfaces/services/post.service';
import { uploadToCloudinary } from '../cloudinary';
import { notificationRepository } from './firebase-notification.repository';

export class FirebasePostRepository implements IPostService {
  private readonly postsCollection = collection(db, 'posts');

  async createPost(post: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
    try {
      const postData = {
        uid: post.uid,
        displayName: post.displayName,
        content: post.content,
        photoURL: post.photoURL || null,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(this.postsCollection, postData);
      
      // Get all users except the one who created the post
      const usersCollection = collection(db, 'users');
      const usersQuery = query(usersCollection, where('uid', '!=', post.uid));
      const usersSnapshot = await getDocs(usersQuery);

      // Send notifications to all other users
      const notificationPromises = usersSnapshot.docs.map(async (userDoc) => {
        const userData = userDoc.data();
        await notificationRepository.sendNotification({
          recipientUid: userData.uid,
          senderDisplayName: post.displayName,
          senderPhotoURL: post.photoURL || null,
          type: 'new_post',
          postId: docRef.id
        });
      });

      // Wait for all notifications to be sent
      await Promise.all(notificationPromises);
      
      return {
        ...post,
        id: docRef.id,
        createdAt: new Date()
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

  async uploadImage(file: File): Promise<{ url: string }> {
    try {
      return await uploadToCloudinary(file);
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw new Error('Error al subir la imagen a Cloudinary');
    }
  }
}

export const postRepository = new FirebasePostRepository();
