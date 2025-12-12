import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, Animated } from 'react-native';
import { useAlertContext } from '../../../context/AlertContext';
import { colors } from '../../../theme/colors';
import { BlurView } from 'expo-blur';

export const AlertModal = () => {
  const { alertState, hideAlert } = useAlertContext();
  const { visible, title, message, type } = alertState;
  const scaleValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        damping: 15,
        stiffness: 150,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const getTypeColor = () => {
    switch (type) {
      case 'success': return colors.success;
      case 'error': return colors.palette.red[500];
      case 'warning': return colors.warning;
      case 'info': default: return colors.info;
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={hideAlert}
    >
      <TouchableWithoutFeedback onPress={hideAlert}>
        <View style={styles.overlay}>
            {/* Optional: Add Blur if desired, but overlay color is usually enough for modal feel */}
            {/* <BlurView intensity={20} style={StyleSheet.absoluteFill} /> */}
            
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
                <View style={[styles.headerBar, { backgroundColor: getTypeColor() }]} />
                
                <View style={styles.content}>
                  <Text style={[styles.title, { color: getTypeColor() }]}>{title}</Text>
                  <Text style={styles.message}>{message}</Text>
                  
                  <TouchableOpacity 
                    style={[styles.button, { backgroundColor: getTypeColor() }]} 
                    onPress={hideAlert}
                  >
                    <Text style={styles.buttonText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.secondaryBg,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  headerBar: {
    height: 6,
    width: '100%',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
