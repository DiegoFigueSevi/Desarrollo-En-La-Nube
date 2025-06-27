import { collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import type { Notification, INotificationService } from '../../domain/interfaces/services/notification.service';

export class FirebaseNotificationRepository implements INotificationService {
  private readonly notificationsCollection = collection(db, 'notifications');

  async sendNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'seen'>): Promise<void> {
    try {
      await addDoc(this.notificationsCollection, {
        ...notification,
        seen: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      throw new Error('Error al enviar la notificación');
    }
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        this.notificationsCollection,
        where('recipientUid', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date()
      })) as Notification[];
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw new Error('Error al obtener las notificaciones');
    }
  }

  async markAsSeen(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(this.notificationsCollection, notificationId);
      await updateDoc(notificationRef, { seen: true });
    } catch (error) {
      console.error('Error marking notification as seen:', error);
      throw new Error('Error al marcar la notificación como vista');
    }
  }
}

export const notificationRepository = new FirebaseNotificationRepository();
