import { NotificationStrategy } from '../types/NotificationStrategy';
import { NotificationContent, NotificationType } from '../types/NotificationTypes';
import { NotificationMessage } from '../types/NotificationMessages';

interface FriendRequestPayload {
  requesterId: string;
  requesterName: string;
  avatarUrl?: string;
}

export class FriendRequestStrategy implements NotificationStrategy<FriendRequestPayload> {
  getContent(payload: FriendRequestPayload): NotificationContent {
    const { requesterName } = payload;
    
    return {
      title: NotificationMessage.FRIEND_REQUEST_TITLE,
      body: NotificationMessage.FRIEND_REQUEST_BODY.replace('{name}', requesterName),
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
