import { NotificationStrategy } from './NotificationStrategy';
import { NotificationContent, NotificationType } from '../types/NotificationTypes';

interface FriendRequestPayload {
  requesterId: string;
  requesterName: string;
  avatarUrl?: string;
}

export class FriendRequestStrategy implements NotificationStrategy<FriendRequestPayload> {
  getContent(payload: FriendRequestPayload): NotificationContent {
    const { requesterName } = payload;
    
    return {
      title: 'New Friend Request',
      body: `${requesterName} wants to be a friend!`,
      data: { 
        type: NotificationType.FRIEND_REQUEST,
        ...payload 
      },
    };
  }

  handleTap(data: Record<string, any>, router: any): void {
    // Navigate to Notifications Screen (where requests are listed)
    router.push('/notifications');
  }
}
