import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, TouchableWithoutFeedback } from "react-native";
import { colors } from "../../../../theme/colors";

import { useAuthStore } from "../../../auth/stores/authStore";

interface UserActionModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
  onShowProfile: () => void;
  onSendMessage: () => void;
}

export default function UserActionModal({ 
  visible, 
  onClose, 
  user, 
  onShowProfile,
  onSendMessage,
}: UserActionModalProps) {
  const { accessToken } = useAuthStore();
  
  const handleAddFriend = async () => {
      // ... existing code ...
      if (!user || !accessToken) return;
      
      try {
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/friends/request`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify({ targetUserId: user.id }) // Note: user.id here must be the Mongo ID, not Matrix ID
          });
          
          if (response.ok) {
              console.log('Friend request sent!');
              alert('Friend request sent!');
          } else {
              const data = await response.json();
              alert(data.message || 'Failed to send request');
          }
      } catch (e) {
          console.error(e);
          alert('Error sending request');
      }
      onClose();
  };
  if (!user) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.avatarContainer}>
                  {user.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarText}>
                        {user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.userName}>{user.name}</Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.primaryButton} onPress={onSendMessage}>
                  <Text style={styles.primaryButtonText}>Send Message</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={onShowProfile}>
                  <Text style={styles.secondaryButtonText}>Show Profile</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.secondaryButton} onPress={handleAddFriend}>
                  <Text style={styles.secondaryButtonText}>Add Friend</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    backgroundColor: colors.secondaryBg,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.tertiaryBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.accent,
  },
  avatarText: {
    color: colors.textSecondary,
    fontSize: 32,
    fontWeight: "bold",
  },
  userName: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  actions: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
});
