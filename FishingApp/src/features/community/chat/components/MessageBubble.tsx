import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { colors } from "../../../../theme/colors";
import { Message } from "../types/chatTypes";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showAvatar?: boolean;
  onAvatarPress?: (user: { id: string; name: string; avatar?: string }) => void;
}

export default function MessageBubble({ message, isMe, showAvatar = true, onAvatarPress }: MessageBubbleProps) {
  
  const handleAvatarPress = () => {
    if (onAvatarPress) {
      onAvatarPress({
        id: message.senderId,
        name: message.senderName,
        avatar: message.senderAvatar
      });
    }
  };

  const renderAvatar = () => (
    <TouchableOpacity 
      onPress={handleAvatarPress}
      activeOpacity={0.8}
      style={[styles.avatarContainer, isMe && { marginRight: 0, marginLeft: 8 }]}
    >
      {message.senderAvatar ? (
        <Image 
          source={{ uri: message.senderAvatar }} 
          style={styles.avatar}
          onError={(e) => console.log(`[MessageBubble] Failed to load avatar: ${message.senderAvatar}`, e.nativeEvent.error)}
        />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarText}>
            {message.senderName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isMe ? styles.containerMe : styles.containerOther]}>
      {!isMe && showAvatar && renderAvatar()}
      
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        {!isMe && <Text style={styles.senderName}>{message.senderName}</Text>}
        
        {message.imageUrl && (
          <Image source={{ uri: message.imageUrl }} style={styles.messageImage} resizeMode="cover" />
        )}

        {message.text ? <Text style={styles.text}>{message.text}</Text> : null}
        
        <Text style={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      {isMe && showAvatar && renderAvatar()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 12,
    alignItems: "flex-end",
  },
  containerMe: {
    justifyContent: "flex-end",
  },
  containerOther: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.tertiaryBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "bold",
  },
  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 16,
  },
  bubbleMe: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: colors.tertiaryBg,
    borderBottomLeftRadius: 2,
  },
  senderName: {
    color: colors.accentSecondary,
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  text: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    color: colors.overlay20,
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 4,
  },
});
