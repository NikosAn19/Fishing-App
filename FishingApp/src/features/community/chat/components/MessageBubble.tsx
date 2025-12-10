import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"; // Revert to RN Image
// import { Image } from "expo-image"; 
import { colors } from "../../../../theme/colors";
import { MessageWithSender } from "../domain/entities/Message";

interface MessageBubbleProps {
  message: MessageWithSender;
  isMe: boolean;
  showAvatar?: boolean;
  onAvatarPress?: (user: { id: string; name: string; avatar?: string }) => void;
  onImagePress?: (imageUrl: string) => void;
}

const MessageBubble = React.memo(({ message, isMe, showAvatar = true, onAvatarPress, onImagePress }: MessageBubbleProps) => {
  const [showTimestamp, setShowTimestamp] = React.useState(false);

  // Check if message is "Image Only" (has image attachment + no text or 'Image' text)
  const isImageOnly = message.attachments?.some(a => a.type === 'image') && 
                      (!message.text || message.text === 'Image');

  const handleAvatarPress = () => {
    if (onAvatarPress) {
      onAvatarPress({
        id: message.senderId,
        name: message.senderName,
        avatar: message.senderAvatar
      });
    }
  };

  const toggleTimestamp = () => {
    setShowTimestamp(!showTimestamp);
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
      
      <View style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
        {showTimestamp && (
          <Text style={[styles.timestamp, isMe ? styles.timestampMe : styles.timestampOther]}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}

        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={toggleTimestamp}
          style={[
            styles.bubble, 
            isMe ? styles.bubbleMe : styles.bubbleOther,
            !showAvatar && !isMe && { marginLeft: 40 },
            // Modern UI: Remove padding and background for image-only messages
            isImageOnly && { padding: 0, backgroundColor: 'transparent' }
          ]}
        >
          {/* Render attachments */}
          {message.attachments?.map((attachment, index) => {
            switch (attachment.type) {
                  case 'image':
                    return (
                      <TouchableOpacity 
                        key={index}
                        activeOpacity={0.9}
                        onPress={() => onImagePress?.(attachment.url)}
                      >
                        <Image
                          source={{ uri: attachment.url }}
                          style={{
                            width: Math.min(attachment.width * 0.5, 250),
                            height: Math.min(attachment.height * 0.5, 250),
                            borderRadius: 12, 
                            marginBottom: message.text && message.text !== 'Image' ? 8 : 0,
                            backgroundColor: '#e0e0e0',
                          }}
                          resizeMode="cover"
                          onError={(e) => console.log(`[MessageBubble] RNImage Failed: ${attachment.url}`, e.nativeEvent.error)}
                        />
                      </TouchableOpacity>
                    );
                  
                  case 'video':
                    return (
                      <View key={index} style={styles.videoContainer}>
                        <Image
                          source={{ uri: attachment.thumbnail || attachment.url }}
                          style={styles.videoThumbnail}
                          resizeMode="cover"
                        />
                        <Text style={styles.videoDuration}>
                          {Math.floor(attachment.duration / 60)}:{String(Math.floor(attachment.duration % 60)).padStart(2, '0')}
                        </Text>
                      </View>
                    );
                  
                  case 'audio':
                    return (
                      <View key={index} style={styles.audioContainer}>
                        <Text style={styles.audioText}>
                          🎵 Audio ({Math.floor(attachment.duration)}s)
                        </Text>
                      </View>
                    );
                  
                  case 'file':
                    return (
                      <View key={index} style={styles.fileContainer}>
                        <Text style={styles.fileName}>📄 {attachment.filename}</Text>
                        <Text style={styles.fileSize}>
                          {attachment.size < 1024 ? `${attachment.size} B` : 
                           attachment.size < 1024 * 1024 ? `${(attachment.size / 1024).toFixed(1)} KB` :
                           `${(attachment.size / (1024 * 1024)).toFixed(1)} MB`}
                        </Text>
                      </View>
                    );
                  
                  default:
                    return null;
                }
              })}
    
              {/* Render text (caption or standalone) */}
              {message.text && message.text !== 'Image' && <Text style={[styles.text, isMe ? styles.textMe : styles.textOther]}>{message.text}</Text>}
            </TouchableOpacity>
      </View>
      
      {isMe && showAvatar && renderAvatar()}
    </View>
  );
});

export default MessageBubble;

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
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  textMe: {
    color: colors.white,
  },
  textOther: {
    color: colors.white,
  },
  timestamp: {
    color: colors.overlay20,
    fontSize: 10,
    marginBottom: 4,
    alignSelf: 'center', // Center above the bubble? Or align with bubble edge?
  },
  timestampMe: {
    alignSelf: 'flex-end',
  },
  timestampOther: {
    alignSelf: 'flex-start',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 4,
  },
  videoContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  videoThumbnail: {
    width: 250,
    height: 150,
    borderRadius: 8,
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: colors.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
  },
  audioContainer: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 8,
  },
  audioText: {
    color: colors.white,
    fontSize: 14,
  },
  fileContainer: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    color: colors.white,
    fontSize: 14,
    marginBottom: 4,
  },
  fileSize: {
    color: colors.textTertiary,
    fontSize: 12,
  },
});
