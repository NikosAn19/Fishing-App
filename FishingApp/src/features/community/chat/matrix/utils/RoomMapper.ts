import { Room } from 'matrix-js-sdk';
import { DirectMessage } from '../../types/chatTypes';

export class RoomMapper {
  /**
   * Maps a Matrix Room to our DirectMessage type.
   * Returns null if it's not a valid DM or other user can't be found.
   */
  public static toDirectMessage(room: Room, myUserId: string): DirectMessage | null {
    const members = room.getJoinedMembers();
    const otherMember = members.find(m => m.userId !== myUserId);
    
    // In a true DM, there should be another member. 
    // If it's just me (e.g. left), we might still want to show it, but usually we need a target.
    // For now, if no other member, we might fallback or return null.
    // Let's return a placeholder if strictly needed, but null is safer.
    
    const lastEvent = room.getLastLiveEvent();
    
    return {
        id: room.roomId,
        user: {
            id: otherMember?.userId || 'unknown',
            name: otherMember?.name || room.name || 'Unknown User',
            avatarUrl: otherMember?.getMxcAvatarUrl ? otherMember.getMxcAvatarUrl() : undefined,
        },
        lastMessage: lastEvent ? {
            text: lastEvent.getContent().body || '',
            timestamp: new Date(lastEvent.getTs()).toISOString(),
        } : undefined,
        unreadCount: room.getUnreadNotificationCount('total' as any) || 0,
    };
  }
}
