import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { colors } from "../../../../theme/colors";
import { ChatOption } from "../domain/enums/ChatOption";

interface ChatOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: ChatOption) => void;
  availableOptions: ChatOption[];
}

export default function ChatOptionsModal({ 
  visible, 
  onClose, 
  onSelect, 
  availableOptions
}: ChatOptionsModalProps) {

  const getLabel = (option: ChatOption): string => {
    switch (option) {
      case ChatOption.DELETE: return 'Delete Chat';
      case ChatOption.LEAVE: return 'Leave Channel';
      case ChatOption.MUTE: return 'Mute Notifications';
      case ChatOption.REPORT: return 'Report';
      case ChatOption.VIEW_MEMBERS: return 'View Members';
      case ChatOption.ADD_MEMBERS: return 'Add Members';
      default: return '';
    }
  };

  const isDestructive = (option: ChatOption): boolean => {
    return option === ChatOption.DELETE || option === ChatOption.LEAVE || option === ChatOption.REPORT;
  };

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
              <Text style={styles.title}>Chat Options</Text>
              
              <View style={styles.actions}>
                {availableOptions.map((option) => (
                  <TouchableOpacity 
                     key={option}
                     style={[
                       styles.button, 
                       isDestructive(option) ? styles.destructiveButton : styles.defaultButton
                     ]} 
                     onPress={() => {
                         onClose();
                         onSelect(option);
                     }}
                  >
                    <Text style={[
                      styles.buttonText,
                      isDestructive(option) ? styles.destructiveText : styles.defaultText
                    ]}>
                      {getLabel(option)}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
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
    maxWidth: 300,
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
  title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 20,
  },
  actions: {
    width: "100%",
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  destructiveButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)', // Light red
  },
  defaultButton: {
    backgroundColor: colors.tertiaryBg,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  destructiveText: {
    color: '#FF3B30', // System Red
  },
  defaultText: {
    color: colors.textPrimary,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
    marginTop: 8,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
});
