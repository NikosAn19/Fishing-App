import { JSON_HEADERS, apiFetchJson } from "../../../../../utils/apiClient";

const CHAT_BASE_PATH = "/api/chat";

export interface StartDirectChatResponse {
  success: boolean;
  roomId: string;
}

export async function startDirectChat(recipientId: string): Promise<string | null> {
  try {
    const response = await apiFetchJson<StartDirectChatResponse>(`${CHAT_BASE_PATH}/direct`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ recipientId }),
    });

    if (response.success) {
      return response.roomId;
    }
    return null;
  } catch (error) {
    console.error("Failed to start direct chat:", error);
    return null;
  }
}

export async function createChannel(name: string, topic?: string): Promise<string | null> {
  try {
    const response = await apiFetchJson<StartDirectChatResponse>(`${CHAT_BASE_PATH}/channel`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ name, topic }),
    });

    if (response.success) {
      return response.roomId;
    }
    return null;
  } catch (error) {
    console.error("Failed to create channel:", error);
    return null;
  }
}

export interface PublicChannel {
  _id: string;
  matrixRoomId: string;
  name: string;
  topic?: string;
  slug?: string;
  region_code?: string;
  participants: string[];
}

export interface GetPublicChannelsResponse {
  success: boolean;
  channels: PublicChannel[];
}

export async function getPublicChannels(): Promise<PublicChannel[]> {
  try {
    const response = await apiFetchJson<GetPublicChannelsResponse>(`${CHAT_BASE_PATH}/public`, {
      method: "GET",
      headers: JSON_HEADERS,
    });

    if (response.success) {
      return response.channels;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch public channels:", error);
    return [];
  }
}

export const chatApi = {
  startDirectChat,
  createChannel,
  getPublicChannels,
};
