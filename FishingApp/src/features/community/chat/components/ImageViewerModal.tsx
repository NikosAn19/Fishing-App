import React from 'react';
import ImageViewing from 'react-native-image-viewing';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '../../../../theme/colors';

interface ImageViewerModalProps {
  visible: boolean;
  imageUrls: string[];
  initialIndex: number;
  onClose: () => void;
}

/**
 * Full screen image viewer with zoom and swipe support.
 * Uses react-native-image-viewing under the hood.
 */
export default function ImageViewerModal({
  visible,
  imageUrls,
  initialIndex,
  onClose
}: ImageViewerModalProps) {
  // Map strings to objects required by the library
  const images = imageUrls.map(url => ({ uri: url }));

  return (
    <ImageViewing
      images={images}
      imageIndex={initialIndex}
      visible={visible}
      onRequestClose={onClose}
      swipeToCloseEnabled={true}
      doubleTapToZoomEnabled={true}
      backgroundColor={colors.primaryBg} // Use app theme background
      FooterComponent={({ imageIndex }) => (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {imageIndex + 1} / {images.length}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  footer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  }
});
