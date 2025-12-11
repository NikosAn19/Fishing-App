import { useEffect, useRef } from 'react';
import { usePathname } from 'expo-router';
import { AppRepository } from '../../../repositories';
import { useChatStore } from '../../community/chat/infrastructure/state/ChatStore';
import { AuthStatus } from '../../auth/types/authTypes';
import { notificationManager } from '../NotificationManager';
import { NotificationType } from '../types/NotificationTypes';
import { initializeNotificationStrategies } from '../index';

interface UseChatNotificationsProps {
  authStatus: AuthStatus;
}

/**
 * Hook to manage Global Chat Notifications
 * - Requests permissions
 * - Subscribes to global Matrix messages
 * - Triggers local notifications (Banner + Badge)
 */
export function useChatNotifications({ authStatus }: UseChatNotificationsProps) {
  const pathname = usePathname();
  
  // Ref to track current path inside async callbacks without re-subscribing
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupNotifications = async () => {
      if (authStatus !== AuthStatus.AUTHENTICATED) return;

      // 1. Initialize Strategies
      initializeNotificationStrategies();

      // 2. Ensure Permissions (Delegated to Manager)
      const hasPermission = await notificationManager.ensurePermissions();
      if (!hasPermission) return;

      // 3. Subscribe to GLOBAL messages
      try {
        const chatRepo = AppRepository.chat; 
        
        unsubscribe = chatRepo.subscribeToAllMessages(async (roomId, message, senderName) => {
          // Check if user is already looking at this room
          const currentPath = pathnameRef.current;
          const isInRoom = currentPath.includes(`/chat/${roomId}`);
          
          if (!isInRoom) {
             console.log(`🔔 Showing notification for ${roomId} from ${senderName}`);
             
             // A. Show Notification via Manager
             await notificationManager.show(NotificationType.CHAT_MESSAGE, { roomId, message, senderName });

             // B. Increment Badge in Store
             useChatStore.getState().incrementUnread(roomId);
          } else {
             console.log(`👀 User is in room ${roomId}, skipping notification`);
          }
        });
        
        console.log('✅ Subscribed to global chat messages');

      } catch (error) {
        console.log('⚠️ Failed to subscribe to chat messages (likely client not ready yet):', error);
      }
    };

    setupNotifications();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [authStatus]);
}
