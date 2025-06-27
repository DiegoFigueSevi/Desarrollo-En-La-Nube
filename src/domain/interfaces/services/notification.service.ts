import { Timestamp } from 'firebase/firestore';

export interface Notification {
  id?: string;
  recipientUid: string;
  senderDisplayName: string;
  senderPhotoURL: string | null;
  type: 'new_post' | 'like' | 'comment';
  postId: string;
  seen: boolean;
  createdAt: Timestamp | Date | string;
}

export interface INotificationService {
  sendNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'seen'>): Promise<void>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markAsSeen(notificationId: string): Promise<void>;
}
