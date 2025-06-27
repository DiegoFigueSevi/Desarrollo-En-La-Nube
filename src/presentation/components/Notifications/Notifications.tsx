import { useState, useEffect, useCallback } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, Box, Avatar, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { notificationRepository } from '../../../infrastructure/repositories';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../../application/contexts/AuthContext';
import type { Notification } from '../../../domain/interfaces/services/notification.service';
import { Timestamp } from 'firebase/firestore';

export const Notifications = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const loadNotifications = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      const userNotifications = await notificationRepository.getUserNotifications(user.uid);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.seen).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadNotifications();
      // Set up real-time listener for new notifications
      const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user?.uid, loadNotifications]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    // Mark all notifications as seen when opening the menu
    markAllAsRead();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const markAllAsRead = async () => {
    if (!user?.uid) return;
    
    try {
      const unseenNotifications = notifications.filter(n => !n.seen);
      await Promise.all(
        unseenNotifications.map(notification => 
          notification.id && notificationRepository.markAsSeen(notification.id)
        )
      );
      setUnreadCount(0);
      loadNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const formatNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'new_post':
        return `${notification.senderDisplayName} ha publicado algo nuevo`;
      default:
        return 'Nueva notificación';
    }
  };

  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={handleMenuOpen}
        aria-label="show notifications"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          style: {
            width: 350,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Notificaciones
          </Typography>
        </Box>
        <Divider />
        
        {notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No hay notificaciones
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {notifications.map((notification) => (
              <MenuItem 
                key={notification.id}
                onClick={() => {
                  // Navigate to the post or perform action
                  handleMenuClose();
                }}
                sx={{
                  borderLeft: notification.seen ? 'none' : '3px solid #1976d2',
                  py: 1.5,
                  px: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                  <Avatar 
                    src={notification.senderPhotoURL || undefined}
                    alt={notification.senderDisplayName}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  >
                    {notification.senderDisplayName?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      {formatNotificationText(notification)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(
                        notification.createdAt instanceof Timestamp 
                          ? notification.createdAt.toDate() 
                          : new Date(notification.createdAt), 
                        { 
                          addSuffix: true,
                          locale: es 
                        }
                      )}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Box>
        )}
      </Menu>
    </>
  );
};
