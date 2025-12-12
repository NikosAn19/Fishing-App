import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, TouchableWithoutFeedback } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../../../theme/colors";

import { useAuthStore } from "../../../auth/stores/authStore";
import { AppRepository } from "../../../../repositories";
import { UserAction } from "../domain/enums/UserAction";
import { useAlert } from "../../../../hooks/alerts/useAlert";
import { AlertRegistry } from "../../../../generic/common/alerts/AlertRegistry";
import { AlertMessage } from "../../../../generic/common/alerts/messages";

interface UserActionModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
  onShowProfile: () => void;
}

export default function UserActionModal({ 
  visible, 
  onClose, 
  user, 
  onShowProfile,
}: UserActionModalProps) {
  const router = useRouter();
  const accessToken = useAuthStore(state => state.accessToken);
  const [userEntity, setUserEntity] = React.useState<any>(null);

  const { showAlert } = useAlert();

  React.useEffect(() => {
    const loadUser = async () => {
      if (!user) return;
      try {
        // Resolve UserEntity (handle Matrix ID vs Server ID)
        let entity = null;
        if (user.id.startsWith('@')) {
           entity = await AppRepository.user.getUserByMatrixId(user.id);
        } else {
           entity = await AppRepository.user.getUser(user.id);
        }
        setUserEntity(entity);
      } catch (e) {
        console.warn('UserActionModal: Failed to resolve user entity', e);
      }
    };
    loadUser();
  }, [user]);
  
  const handleAddFriend = async () => {
      if (!userEntity) {
          showAlert(AlertRegistry.info(AlertMessage.WAIT_FOR_INFO));
          return;
      }
      
      try {
          // Ensure we are sending a clean ID
          const cleanUserEntity = { ...userEntity, id: userEntity.id.trim() };
          await AppRepository.user.performUserAction(cleanUserEntity, UserAction.ADD_FRIEND);
          showAlert(AlertRegistry.success(AlertMessage.FRIEND_REQUEST_SENT));
      } catch (e: any) {
          // Log only real errors to console
          const isConflict = e.message?.includes('already');
          if (!isConflict) {
             console.error(e);
          } else {
             console.log(`[Info] ${e.message}`);
          }

          // Use Registry to map error to UI Alert
          showAlert(AlertRegistry.get(e));
      }
      onClose();
  };

  const handleSendMessage = async () => {
      if (!userEntity) {
          alert('User information not fully loaded yet.');
          return;
      }
      
      try {
          const roomId = await AppRepository.user.performUserAction(userEntity, UserAction.CHAT);
          onClose();
          if (roomId) {
              router.push(`/community/chat/${roomId}`);
          }
      } catch (e) {
          console.error(e);
          alert('Failed to start chat');
      }
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
                <TouchableOpacity style={styles.primaryButton} onPress={handleSendMessage}>
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
