import { MatrixClient, EventType, MsgType, RoomEvent, Room, NotificationCountType, Filter, EventTimeline } from 'matrix-js-sdk';
import { ChatAdapterPort } from '../../domain/ports/ChatAdapterPort';
import { Message, MessageAttachment, ImageAttachment, VideoAttachment, AudioAttachment, FileAttachment } from '../../domain/entities/Message';
import { ChatRoom } from '../../domain/entities/ChatRoom';
import { DirectMessage } from '../../domain/entities/DirectMessage';
import { MessageStatus } from '../../domain/enums/MessageStatus';
import { ChatRoomType } from '../../domain/enums/ChatRoomType';
import { PaginationService } from '../../application/services/PaginationService';
import { EventHandlerRegistry } from '../../application/services/EventHandlerRegistry';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { CHAT_FILTER_DEFINITION, MATRIX_CONSTANTS } from '../../matrix/MatrixConfig';
import { useIdentityStore } from '../../../../auth/stores/IdentityStore';

/**
 * Matrix implementation of ChatAdapterPort
 * Thin layer - only translation, no business logic
 */
export class MatrixChatAdapter implements ChatAdapterPort {
  private paginationService: PaginationService;
  private eventRegistry: EventHandlerRegistry;
  private processedEventIds: Set<string> = new Set();

  constructor(private client: MatrixClient) {
    this.paginationService = new PaginationService(client);
    this.eventRegistry = new EventHandlerRegistry();
  }

  async sendMessage(roomId: string, text: string): Promise<string> {
    const response = await this.client.sendEvent(roomId, EventType.RoomMessage, {
      msgtype: MsgType.Text,
      body: text,
    });
    return response.event_id;
  }

  getMessages(roomId: string): Message[] {
    const room = this.client.getRoom(roomId);
    if (!room) return [];

    return room.timeline
      .filter(event => event.getType() === EventType.RoomMessage)
      .map(event => this.toMessage(event));
  }

  subscribeToRoom(roomId: string, onMessage: (msg: Message) => void): () => void {
    const handler = (event: any, room: any, toStartOfTimeline?: boolean) => {
      // CRITICAL: Ignore pagination events (old messages being loaded)
      // toStartOfTimeline = true means this is from pagination (scrollback)
      // toStartOfTimeline = false/undefined means this is a new real-time message
      if (toStartOfTimeline === true) {
        // console.log(`🔄 Ignoring pagination event for room ${roomId}`);
        return;
      }
      
      // CRITICAL: Ignore local echoes (we handle optimistic updates ourselves)
      // Matrix SDK emits events with status 'sending' or temporary IDs starting with '~' or 'm'.
      if (event.status === MessageStatus.SENDING || event.isSending()) {
          console.log(`🔄 Ignoring local echo for ${event.getId()}`);
          return;
      }

      // Double check: if ID looks temporary (optional, mostly covered by isSending)
      if (event.getId().startsWith('~')) {
          console.log(`🔄 Ignoring local transaction ID ${event.getId()}`);
          return;
      }
      
      if (event.getRoomId() === roomId && event.getType() === EventType.RoomMessage) {
        console.log(`📨 New real-time message in ${roomId}: ${event.getId()}`);
        onMessage(this.toMessage(event));
      }
    };

    this.client.on(RoomEvent.Timeline, handler);
    return () => this.client.off(RoomEvent.Timeline, handler);
  }

  async loadHistory(roomId: string, oldestMessageId?: string): Promise<{ messages: Message[]; hasMore: boolean }> {
    const room = this.client.getRoom(roomId);
    if (!room) {
      console.log(`❌ MatrixChatAdapter: Room ${roomId} not found for loadHistory`);
      return { messages: [], hasMore: false };
    }

    // 1. VIRTUAL PAGINATION: Check memory first
    if (oldestMessageId) {
        const allMessages = this.getMessages(roomId);
        const index = allMessages.findIndex(m => m.id === oldestMessageId);
        
        if (index > 0) {
            console.log(`🧠 MatrixChatAdapter: Found oldest message at index ${index}. Virtual paginating from memory...`);
            // We have messages older than the current oldest one in memory
            // Grab up to BATCH_SIZE messages strictly BEFORE the index
            const countToTake = MATRIX_CONSTANTS.BATCH_SIZE;
            const startIndex = Math.max(0, index - countToTake);
            const virtualBatch = allMessages.slice(startIndex, index);
            
            console.log(`🧠 MatrixChatAdapter: Returning ${virtualBatch.length} messages from memory`);
            return { messages: virtualBatch, hasMore: true }; // Check logic: if startIndex > 0, we still have more in memory
        }
    }

    console.log(`📜 MatrixChatAdapter: Loading more history from NETWORK for ${roomId}...`);
    
    try {
      const timeline = room.getLiveTimeline();
      
      // CRITICAL: Apply filter to ensure pagination only fetches valid messages
      const filter = new Filter(this.client.getUserId());
      filter.setDefinition(CHAT_FILTER_DEFINITION);
      timeline.getTimelineSet().setFilter(filter);

      // CRITICAL FIX: Capture message IDs BEFORE pagination
      const beforeMessages = this.getMessages(roomId);
      const beforeIds = new Set(beforeMessages.map(m => m.id));
      const beforeCount = beforeMessages.length;
      
      console.log(`📜 Before pagination: ${beforeCount} messages in timeline`);
      
      // Paginate to load older messages
      const hasMore = await this.client.paginateEventTimeline(timeline, {
        backwards: true,
        limit: MATRIX_CONSTANTS.BATCH_SIZE
      });
      
      // Get ALL messages after pagination
      const afterMessages = this.getMessages(roomId);
      
      // CRITICAL FIX: Filter to only NEW messages (not in beforeIds)
      const newMessages = afterMessages.filter(m => !beforeIds.has(m.id));
      
      console.log(`📜 MatrixChatAdapter: Loaded ${newMessages.length} new messages (${beforeCount} → ${afterMessages.length}), hasMore=${hasMore}`);
      
      // Return ONLY the new messages
      return { messages: newMessages, hasMore };
    } catch (error) {
      console.error(`❌ MatrixChatAdapter: Failed to load history for ${roomId}`, error);
      return { messages: [], hasMore: false };
    }
  }

  async fetchInitialMessages(roomId: string): Promise<{ messages: Message[]; hasMore: boolean }> {
    const room = this.client.getRoom(roomId);
    if (!room) {
      console.log(`❌ MatrixChatAdapter: Room ${roomId} not found`);
      return { messages: [], hasMore: false };
    }

    console.log(`📥 MatrixChatAdapter: Loading initial messages for ${roomId}...`);
    
    try {
      const timeline = room.getLiveTimeline();
      
      // Apply filter to ensure efficient fetching
      const filter = new Filter(this.client.getUserId());
      filter.setDefinition(CHAT_FILTER_DEFINITION);
      timeline.getTimelineSet().setFilter(filter);

      // Simplified logic: We can trust pagination now because of the filter
      // If we don't have enough messages, try one pagination
      if (this.getMessages(roomId).length < 20) {
         console.log('📥 Not enough initial messages, triggering pagination...');
         await this.client.paginateEventTimeline(timeline, {
            backwards: true,
            limit: MATRIX_CONSTANTS.BATCH_SIZE
         });
      }
      
      const allMessages = this.getMessages(roomId);
      
      // Return what we have, up to limit
      const messages = allMessages.slice(-MATRIX_CONSTANTS.BATCH_SIZE);
      
      console.log(`📥 MatrixChatAdapter: Returning ${messages.length} messages`);
      
      return { messages, hasMore: true }; // Assume more exists if we hit the limit, exact check is complex
    } catch (error) {
      console.error(`❌ MatrixChatAdapter: Failed to load initial messages for ${roomId}`, error);
      const messages = this.getMessages(roomId);
      return { messages: messages.slice(-MATRIX_CONSTANTS.BATCH_SIZE), hasMore: false };
    }
  }

  async fetchPublicRooms(): Promise<ChatRoom[]> {
    const response = await this.client.publicRooms({});
    
    return response.chunk.map(chunk => {
      // Try to find the actual joined room object to get unread counts
      const realRoom = this.client.getRoom(chunk.room_id);
      const unreadCount = realRoom 
        ? realRoom.getUnreadNotificationCount(NotificationCountType.Total) 
        : 0; // If not joined/found, 0 unreads

      return {
        id: chunk.room_id,
        name: chunk.name || 'Unnamed Room',
        type: ChatRoomType.CHANNEL,
        avatarUrl: chunk.avatar_url,
        unreadCount,
      };
    });
  }

  async fetchDirectMessages(): Promise<DirectMessage[]> {
    const rooms = this.client.getRooms();
    console.log(`🔍 fetchDirectMessages: Found ${rooms.length} total rooms`);
    
    // Also include rooms we are invited to!
    const directRooms = rooms.filter(room => {
        // EXPLICIT FIX: Filter out rooms we have left/forgotten
        // This ensures UI updates immediately even if m.direct sync is lagging
        if (room.getMyMembership() === 'leave') return false;

        const isDirect = this.isDirectChat(room);
        console.log(`   - Room ${room.roomId} (${room.name}): isDirect=${isDirect}, myMembership=${room.getMyMembership()}`);
        return isDirect;
    });
    
    console.log(`✅ fetchDirectMessages: Returning ${directRooms.length} DM rooms`);

    // Sort by last activity
    directRooms.sort((a, b) => {
        const lastEventA = a.timeline.length > 0 ? a.timeline[a.timeline.length - 1].getTs() : 0;
        const lastEventB = b.timeline.length > 0 ? b.timeline[b.timeline.length - 1].getTs() : 0;
        return lastEventB - lastEventA;
    });

    return directRooms.map(room => this.toDirectMessage(room));
  }

  async getRoomDetails(roomId: string): Promise<ChatRoom | null> {
    const room = this.client.getRoom(roomId);
    if (!room) return null;

    const isDirect = this.isDirectChat(room);
    
    let name = room.name || 'Chat';
    let avatarUrl = undefined;
    let otherUserId = undefined;

    if (isDirect) {
        // Use smart resolution for DMs
        const metadata = this.resolveDirectChatMetadata(room);
        name = metadata.displayName;
        avatarUrl = metadata.avatarUrl;
        otherUserId = metadata.userId;
    }

    return {
      id: room.roomId,
      name: name,
      type: isDirect ? ChatRoomType.DIRECT : ChatRoomType.CHANNEL,
      avatarUrl: avatarUrl,
      unreadCount: room.getUnreadNotificationCount(NotificationCountType.Total) || 0,
      metadata: {
        otherUserId
      }
    };
  }

  async initialize(): Promise<boolean> {
    return this.client !== null && this.client.isInitialSyncComplete();
  }

  subscribeToRoomUpdates(callback: (rooms: ChatRoom[]) => void): () => void {
    const handler = async () => {
      const rooms = await this.fetchPublicRooms();
      callback(rooms);
    };

    this.client.on(RoomEvent.MyMembership, handler);
    this.client.on(RoomEvent.Timeline, handler);

    return () => {
      this.client.off(RoomEvent.MyMembership, handler);
      this.client.off(RoomEvent.Timeline, handler);
    };
  }

  getCurrentUserId(): string | null {
    return this.client.getUserId();
  }

  async joinOrCreateRoom(channelId: string): Promise<string | null> {
    const { matrixService } = await import('../../matrix/MatrixService');
    return await matrixService.rooms.joinOrOpenChat(channelId);
  }

  async leaveRoom(roomId: string): Promise<boolean> {
    const { matrixService } = await import('../../matrix/MatrixService');
    return await matrixService.rooms.leaveRoom(roomId);
  }

  /**
   * Get all joined rooms with real unread counts
   */
  async getJoinedRooms(): Promise<ChatRoom[]> {
    const rooms = this.client.getRooms();
    
    // Sort by last message timestamp (descending)
    rooms.sort((a, b) => {
        const lastEventA = a.timeline.length > 0 ? a.timeline[a.timeline.length - 1].getTs() : 0;
        const lastEventB = b.timeline.length > 0 ? b.timeline[b.timeline.length - 1].getTs() : 0;
        return lastEventB - lastEventA;
    });

    return rooms.map(room => ({
        id: room.roomId,
        name: room.name || 'Chat',
        type: this.isDirectChat(room) ? ChatRoomType.DIRECT : ChatRoomType.CHANNEL,
        avatarUrl: undefined, // Or get mxc
        unreadCount: room.getUnreadNotificationCount(NotificationCountType.Total) || 0,
    }));
  }

  /**
   * Send message with optional text and/or attachments
   */
  async sendMessageWithAttachments(
    roomId: string,
    text?: string,
    attachments?: MessageAttachment[]
  ): Promise<string> {
    const hasText = text && text.length > 0;
    const hasAttachments = attachments && attachments.length > 0;

    if (!hasText && !hasAttachments) {
      throw new Error('Message must have text or attachments');
    }

    // Single attachment: send as typed message
    if (hasAttachments && attachments.length === 1) {
      return this.sendSingleAttachment(roomId, attachments[0], text);
    }

    // Multiple attachments: send separately
    if (hasAttachments && attachments.length > 1) {
      return this.sendMultipleAttachments(roomId, attachments, text);
    }

    // Text only
    return this.sendMessage(roomId, text!);
  }

  /**
   * Preprocess media (compress images)
   */
  private async preprocessMedia(fileUri: string, type: 'image' | 'video' | 'audio' | 'file'): Promise<string> {
    if (type !== 'image') return fileUri;

    try {
        console.log(`🖼️ MatrixChatAdapter: Compressing image...`);
        const result = await ImageManipulator.manipulateAsync(
            fileUri,
            [{ resize: { width: MATRIX_CONSTANTS.MAX_IMAGE_WIDTH } }], 
            { 
              compress: MATRIX_CONSTANTS.IMAGE_COMPRESSION_QUALITY, 
              format: MATRIX_CONSTANTS.COMPRESSION_FORMAT 
            }
        );
        console.log(`🖼️ Compression success: ${result.uri}`);
        return result.uri;
     } catch (error) {
         console.warn('⚠️ Image compression failed, returning original:', error);
         return fileUri;
     }
  }

  /**
   * Upload media file and return attachment object
   */
  async uploadMedia(
    fileUri: string,
    type: 'image' | 'video' | 'audio' | 'file'
  ): Promise<MessageAttachment> {
    // 1. Get file info (checks existence)
    const originalInfo = await FileSystem.getInfoAsync(fileUri);
    if (!originalInfo.exists) {
      throw new Error('File not found');
    }

    // 2. Preprocess (Compress if image)
    const uploadUri = await this.preprocessMedia(fileUri, type);

    // 3. Info of the actual file to upload (could be the compressed one)
    const fileInfo = await FileSystem.getInfoAsync(uploadUri);
    
    // 4. Fetch blob directly from valid URI
    const response = await fetch(uploadUri);
    const blob = await response.blob(); 
    
    // 5. Determine MIME type (force jpeg for compressed images)
    const mimeType = type === 'image' && uploadUri !== fileUri ? 'image/jpeg' : this.getMimeType(fileUri, type);

    // 6. Upload to Matrix
    const uploadResponse = await this.client.uploadContent(blob, {
      name: `${type}-${Date.now()}${this.getExtension(fileUri)}`,
      type: mimeType,
    });

    // 7. Check existence properly before accessing size
    const size = fileInfo.exists ? fileInfo.size : 0;

    // 8. Create attachment object based on type
    switch (type) {
      case 'image':
        return await this.createImageAttachment(fileUri, uploadResponse.content_uri, size, mimeType);
      
      case 'video':
        return await this.createVideoAttachment(fileUri, uploadResponse.content_uri, size, mimeType);
      
      case 'audio':
        return await this.createAudioAttachment(fileUri, uploadResponse.content_uri, size, mimeType);
      
      case 'file':
        return this.createFileAttachment(fileUri, uploadResponse.content_uri, size, mimeType);
    }
  }

  /**
   * Send single attachment message
   */
  private async sendSingleAttachment(
    roomId: string,
    attachment: MessageAttachment,
    caption?: string
  ): Promise<string> {
    let msgtype: MsgType;
    let content: any;

    switch (attachment.type) {
      case 'image':
        msgtype = MsgType.Image;
        content = {
          msgtype,
          body: caption || 'Image',
          url: attachment.url,
          info: {
            mimetype: attachment.mimeType,
            size: attachment.size,
            w: attachment.width,
            h: attachment.height,
            thumbnail_url: attachment.thumbnail,
          },
        };
        break;

      case 'video':
        msgtype = MsgType.Video;
        content = {
          msgtype,
          body: caption || 'Video',
          url: attachment.url,
          info: {
            mimetype: attachment.mimeType,
            size: attachment.size,
            duration: attachment.duration * 1000,
            w: attachment.width,
            h: attachment.height,
            thumbnail_url: attachment.thumbnail,
          },
        };
        break;

      case 'audio':
        msgtype = MsgType.Audio;
        content = {
          msgtype,
          body: caption || 'Audio',
          url: attachment.url,
          info: {
            mimetype: attachment.mimeType,
            size: attachment.size,
            duration: attachment.duration * 1000,
          },
        };
        break;

      case 'file':
        msgtype = MsgType.File;
        content = {
          msgtype,
          body: attachment.filename,
          filename: attachment.filename,
          url: attachment.url,
          info: {
            mimetype: attachment.mimeType,
            size: attachment.size,
          },
        };
        break;
    }

    const response = await this.client.sendEvent(roomId, EventType.RoomMessage, content);
    return response.event_id;
  }

  /**
   * Send multiple attachments
   */
  private async sendMultipleAttachments(
    roomId: string,
    attachments: MessageAttachment[],
    caption?: string
  ): Promise<string> {
    // Send caption first if present
    if (caption) {
      await this.sendMessage(roomId, caption);
    }

    // Send each attachment
    const eventIds = await Promise.all(
      attachments.map(attachment => this.sendSingleAttachment(roomId, attachment))
    );

    return eventIds[eventIds.length - 1];
  }

  /**
   * Create image attachment with dimensions
   */
  private async createImageAttachment(
    fileUri: string,
    mxcUrl: string,
    size: number,
    mimeType: string
  ): Promise<ImageAttachment> {
    const imageInfo = await ImageManipulator.manipulateAsync(fileUri, [], {
      format: ImageManipulator.SaveFormat.JPEG,
    });

    return {
      id: `img-${Date.now()}`,
      type: 'image',
      url: mxcUrl,
      width: imageInfo.width,
      height: imageInfo.height,
      mimeType,
      size,
    };
  }

  /**
   * Create video attachment
   */
  private async createVideoAttachment(
    fileUri: string,
    mxcUrl: string,
    size: number,
    mimeType: string
  ): Promise<VideoAttachment> {
    return {
      id: `vid-${Date.now()}`,
      type: 'video',
      url: mxcUrl,
      duration: 0,
      width: 1920,
      height: 1080,
      mimeType,
      size,
    };
  }

  /**
   * Create audio attachment
   */
  private async createAudioAttachment(
    fileUri: string,
    mxcUrl: string,
    size: number,
    mimeType: string
  ): Promise<AudioAttachment> {
    return {
      id: `aud-${Date.now()}`,
      type: 'audio',
      url: mxcUrl,
      duration: 0,
      mimeType,
      size,
    };
  }

  /**
   * Create file attachment
   */
  private createFileAttachment(
    fileUri: string,
    mxcUrl: string,
    size: number,
    mimeType: string
  ): FileAttachment {
    const filename = fileUri.split('/').pop() || 'file';
    
    return {
      id: `file-${Date.now()}`,
      type: 'file',
      url: mxcUrl,
      filename,
      mimeType,
      size,
    };
  }



  /**
   * Get MIME type from file URI
   */
  private getMimeType(fileUri: string, type: string): string {
    const ext = fileUri.split('.').pop()?.toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      mp3: 'audio/mpeg',
      m4a: 'audio/mp4',
      wav: 'audio/wav',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    
    return mimeTypes[ext || ''] || `${type}/*`;
  }

  /**
   * Get file extension
   */
  private getExtension(fileUri: string): string {
    const ext = fileUri.split('.').pop();
    return ext ? `.${ext}` : '';
  }

  /**
   * Convert mxc:// URL to http:// URL
   */
  private mxcToHttp(mxcUrl: string): string {
    if (!mxcUrl) return '';

    // Already HTTP?
    if (mxcUrl.startsWith('http') || mxcUrl.startsWith('file://')) {
      return mxcUrl;
    }

    // Must be mxc://
    if (!mxcUrl.startsWith('mxc://')) {
      console.warn(`⚠️ MatrixChatAdapter: Invalid URL format (not mxc, http, or file): ${mxcUrl}`);
      // Return empty string to prevent image component failure
      return ''; 
    }
    
    // Robust splitting: Handle potential whitespace or unexpected chars
    const cleanUrl = mxcUrl.trim();
    const parts = cleanUrl.split('/');
    
    // Format: mxc://server.name/mediaId
    // parts: ['mxc:', '', 'server.name', 'mediaId']
    if (parts.length < 4) {
      console.warn(`⚠️ MatrixChatAdapter: Malformed MXC URL: ${cleanUrl}`);
      return '';
    }
    
    const serverName = parts[2];
    const mediaId = parts[3];
    const baseUrl = this.client.baseUrl;
    const accessToken = this.client.getAccessToken();
    
    // Use modern client/v1 API which is authenticated and reliable
    const url = `${baseUrl}/_matrix/client/v1/media/download/${serverName}/${mediaId}?access_token=${accessToken}`;
    
    console.log(`🔗 MatrixChatAdapter: Converted ${cleanUrl} -> ${url}`);
    return url;
  }

  /**
   * Check if a room is a direct chat
   */
  private isDirectChat(room: Room): boolean {
    const client = this.client;
    
    // 1. CRITICAL: Check global account data for m.direct
    // This is the source of truth for "Does the user consider this a DM?"
    const directEvent = client.getAccountData('m.direct' as any);
    const directContent = directEvent ? directEvent.getContent() : {};
    
    // Check if this room ID exists in any of the user lists in m.direct
    const isDirectInAccountData = Object.values(directContent).some((roomIds: any) => 
        Array.isArray(roomIds) && roomIds.includes(room.roomId)
    );

    if (isDirectInAccountData) {
        return true;
    }

    // 2. Strong Heuristics for "Ghost" prevention
    // If the room is NOT in m.direct, and we have Left it, it should NOT be considered a DM.
    // This prevents deleted chats from reappearing as "unknown" DMs.
    if (room.getMyMembership() === 'leave' || room.getMyMembership() === 'ban') {
        return false;
    }

    // 3. Fallback Heuristics (only for rooms we are effectively joined/invited to)
    const joinRule = room.getJoinRule();
    if (joinRule === 'public') {
        return false;
    }

    const members = room.getJoinedMembers();
    // Allow for invites (1 joined member = me, plus pending invites)
    if (members.length === 1 || members.length === 2) {
         // Check total active members including invites
         const stateMembers = room.getLiveTimeline().getState(EventTimeline.FORWARDS)?.members || {};
         const activeMembers = Object.values(stateMembers).filter(m => 
            m.membership === 'join' || m.membership === 'invite'
         );
         return activeMembers.length === 2;
    }
    
    return members.length === 2;
  }

  /**
   * Centralized Logic for resolving DM Metadata (Name, Avatar, ID)
   * Single Source of Truth for List and Details
   */
  private resolveDirectChatMetadata(room: Room): { userId: string, displayName: string, avatarUrl: string | undefined } {
    const me = this.client.getUserId();
    let otherUserId: string | null = null;

    // 1. Identify Partner ID (m.direct preferred)
    const directEvent = this.client.getAccountData('m.direct' as any);
    const directContent = directEvent ? directEvent.getContent() : {};
    for (const [userId, roomIds] of Object.entries(directContent)) {
        if (Array.isArray(roomIds) && roomIds.includes(room.roomId)) {
            otherUserId = userId;
            break;
        }
    }

    // Fallback: Room Members
    if (!otherUserId) {
        const allMembers = room.getMembers();
        const otherMember = allMembers.find(m => m.userId !== me && (m.membership === 'join' || m.membership === 'invite'));
        if (otherMember) otherUserId = otherMember.userId;
    }

    // Fallback: Just Me (Note to self)
    if (!otherUserId && room.getJoinedMemberCount() === 1) {
        // otherUserId = me; // Optional: Handle self-chat
    }

    const targetId = otherUserId || 'unknown';

    // 2. Resolve Profile (Priority: IdentityStore > Matrix Member > ID)
    let displayName = targetId;
    let avatarUrl: string | undefined = undefined;

    // Check IdentityStore (Fastest + Verified from Channels)
    const cachedIdentity = useIdentityStore.getState().getIdentity(targetId);
    if (cachedIdentity) {
        // console.log(`🧠 MatrixChatAdapter: Resolved ${targetId} from IdentityStore`);
        displayName = cachedIdentity.displayName;
        avatarUrl = cachedIdentity.avatarUrl;
    } else {
        // Check Matrix Room State
        // console.log(`⚠️ MatrixChatAdapter: ${targetId} not in IdentityStore. Checking Room State...`);
        const member = room.getMember(targetId);
        if (member) {
            displayName = (member.name || member.rawDisplayName) || targetId;
            avatarUrl = member.getMxcAvatarUrl() || undefined;
        } else if (targetId === 'unknown' && room.name && room.name !== 'Empty Room') {
             // Absolute fallback if not a DM logic
             displayName = room.name;
        }
    }

    // Cleanup
    if (displayName === 'Empty Room') displayName = targetId; // Better to show ID than "Empty Room"
    if (displayName === me) displayName = 'Me';

    return {
        userId: targetId,
        displayName,
        avatarUrl
    };
  }

  /**
   * Convert Matrix Room to DirectMessage entity
   */
  private toDirectMessage(room: Room): DirectMessage {
    const { userId, displayName, avatarUrl } = this.resolveDirectChatMetadata(room);

    // Last msg logic
    const lastEvent = room.timeline.length > 0 
        ? room.timeline[room.timeline.length - 1] 
        : null; 
        
    const lastMessage = lastEvent ? {
      text: lastEvent.getContent()?.body || '',
      timestamp: new Date(lastEvent.getTs()).toISOString(),
    } : undefined;
    
    const myMembership = room.getMyMembership();
    let status: 'joined' | 'invited' | 'left' = 'joined';
    if (myMembership === 'invite') status = 'invited';
    if (myMembership === 'leave') status = 'left';

    return {
      id: room.roomId,
      user: {
        id: userId,
        name: displayName,
        avatarUrl: avatarUrl,
      },
      lastMessage,
      unreadCount: room.getUnreadNotificationCount(NotificationCountType.Total) || 0,
      status
    };
  }


  /**
   * Subscribe to messages from ALL rooms (for global notifications)
   */
  subscribeToAllMessages(callback: (roomId: string, message: Message, senderName?: string) => void): () => void {
    const handler = (event: any, room: any, toStartOfTimeline?: boolean) => {
      // 0. CRITICAL: Ignore pagination events (history)
      // This is the missing piece that prevents "Recent but read" messages from flooding
      if (toStartOfTimeline === true) {
        // console.log(`🔄 Global Listener: Ignoring pagination/history event for room ${roomId}`);
        return;
      }

      // 1. Filter: Only standard messages
      if (event.getType() !== EventType.RoomMessage) return;

      // 2. Filter: Ignore my own messages
      if (event.getSender() === this.client.getUserId()) return;
      
      // 3. Filter: Ignore incoming edits/redactions for now (keep it simple)
      if (event.isRedacted()) return;

      // 4. CRITICAL: Ignore local echoes (sending status or temp ID)
      if (event.status === MessageStatus.SENDING || event.isSending() || event.getId().startsWith('~')) {
          return;
      }

      // 5. CRITICAL: Dedup events (Matrix can emit multiple times usually during sync)
      // Note: This closure captures 'handler', but we need state across firings.
      // We'll rely on a tiny cache attached to the class instance or closure if possible.
      // Since this is a method, we can't easily add state to the closure without it resetting on re-subscribe?
      // Actually, 'subscribeToAllMessages' is called once by _layout.
      // Let's add a static or class-level Set if needed, but a local Set in closure works for the lifespan of the subscription.
      if (this.processedEventIds.has(event.getId())) {
          return;
      }
      this.processedEventIds.add(event.getId());

      // Cleanup old IDs periodically? For now, we just let it grow (app restart clears it)
      // or we can use a small limit check.
      if (this.processedEventIds.size > 1000) {
          const it = this.processedEventIds.values();
          const first = it.next().value;
          if (first) {
            this.processedEventIds.delete(first);
          }
      }

      // 6. Grace Period Check: Ignore messages older than 60 seconds (prevents flood on restart)
      const now = Date.now();
      const msgTime = event.getTs();
      const age = now - msgTime;
      
      // If message is older than 2 minutes (120000ms), ignore it for notifications
      // This handles the "Initial Sync" dump where old messages are sent
      if (age > 120000) {
          console.log(`⏰ Global Listener: Ignoring old message in ${room.roomId} (Age: ${age}ms)`);
          return;
      }

      // 7. Trigger callback
      // Resolve Sender Name
      const senderId = event.getSender();
      const member = room.getMember(senderId);
      const senderName = member ? member.name : senderId;

      console.log(`🔔 Global Listener: New message in ${room.roomId} from ${senderName}`);
      callback(room.roomId, this.toMessage(event), senderName);
    };

    // Listen to ALL timeline events
    this.client.on(RoomEvent.Timeline, handler);
    return () => this.client.off(RoomEvent.Timeline, handler);
  }

  /**
   * Mark room as read (send receipt)
   */
  async markAsRead(roomId: string, eventId?: string): Promise<void> {
    const room = this.client.getRoom(roomId);
    if (!room) return;

    // specific event or latest
    const eventToMark = eventId 
        ? room.findEventById(eventId) 
        : room.timeline[room.timeline.length - 1];

    if (eventToMark) {
        // Send ephemeral read receipt
        await this.client.sendReadReceipt(eventToMark);
        console.log(`👀 Marked ${roomId} as read up to ${eventToMark.getId()}`);
    }
  }

  /**
   * Pure translation from Matrix Event to Message entity
   */
  private toMessage(event: any): Message {
    const content = event.getContent();
    const msgtype = content.msgtype;
    
    const message: Message = {
      id: event.getId(),
      senderId: event.getSender(),
      status: MessageStatus.SENT,
      timestamp: event.getTs(),
    };
    
    // Add text if present
    if (content.body) {
      message.text = content.body;
    }
    
    // Add attachment based on message type
    if (msgtype && msgtype !== MsgType.Text) {
      const attachment = this.matrixEventToAttachment(content, msgtype);
      if (attachment) {
        message.attachments = [attachment];
      }
    }
    
    return message;
  }

  /**
   * Convert Matrix event content to attachment
   */
  private matrixEventToAttachment(
    content: any,
    msgtype: MsgType
  ): MessageAttachment | null {
    if (!content.url) return null;

    const httpUrl = this.mxcToHttp(content.url);
    const info = content.info || {};

    switch (msgtype) {
      case MsgType.Image:
        return {
          id: `img-${Date.now()}`,
          type: 'image',
          url: httpUrl,
          width: info.w || 0,
          height: info.h || 0,
          thumbnail: info.thumbnail_url ? this.mxcToHttp(info.thumbnail_url) : undefined,
          mimeType: info.mimetype || 'image/jpeg',
          size: info.size || 0,
        };

      case MsgType.Video:
        return {
          id: `vid-${Date.now()}`,
          type: 'video',
          url: httpUrl,
          duration: (info.duration || 0) / 1000,
          width: info.w || 0,
          height: info.h || 0,
          thumbnail: info.thumbnail_url ? this.mxcToHttp(info.thumbnail_url) : undefined,
          mimeType: info.mimetype || 'video/mp4',
          size: info.size || 0,
        };

      case MsgType.Audio:
        return {
          id: `aud-${Date.now()}`,
          type: 'audio',
          url: httpUrl,
          duration: (info.duration || 0) / 1000,
          mimeType: info.mimetype || 'audio/mpeg',
          size: info.size || 0,
        };

      case MsgType.File:
        return {
          id: `file-${Date.now()}`,
          type: 'file',
          url: httpUrl,
          filename: content.filename || content.body || 'file',
          mimeType: info.mimetype || 'application/octet-stream',
          size: info.size || 0,
        };

      default:
        return null;
    }
  }
}

