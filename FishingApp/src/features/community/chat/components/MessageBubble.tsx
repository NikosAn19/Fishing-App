import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { colors } from "../../../../theme/colors";
import { MessageWithSender } from "../domain/entities/Message";

interface MessageBubbleProps {
  message: MessageWithSender;
  isMe: boolean;
  showAvatar?: boolean;
  onAvatarPress?: (user: { id: string; name: string; avatar?: string }) => void;
}

const MessageBubble = React.memo(({ message, isMe, showAvatar = true, onAvatarPress }: MessageBubbleProps) => {
  const [showTimestamp, setShowTimestamp] = React.useState(false);

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
            !showAvatar && !isMe && { marginLeft: 40 } // Indent if no avatar
          ]}
        >
          {message.imageUrl && (
            <Image source={{ uri: message.imageUrl }} style={styles.messageImage} resizeMode="cover" />
          )}

          {message.text ? <Text style={[styles.text, isMe ? styles.textMe : styles.textOther]}>{message.text}</Text> : null}
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
});
