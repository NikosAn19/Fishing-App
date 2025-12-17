import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'lucide-react-native';
import { colors } from '../../../../theme/colors';

interface ProfileAvatarProps {
  avatarUrl?: string;
  isUploading?: boolean;
  onPress?: () => void;
  size?: number;
}

export function ProfileAvatar({ 
  avatarUrl, 
  isUploading = false, 
  onPress,
  size = 120 
}: ProfileAvatarProps) {
  const innerSize = size - 8;
  const imageSize = size - 16;
  
  // Calculate placeholder icon size proportional to the avatar
  const iconSize = size * 0.46; 

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress || isUploading}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[colors.accentGradientStart, colors.accentGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.imageGradientRing, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <View style={[styles.imageInnerRing, { width: innerSize, height: innerSize, borderRadius: innerSize / 2 }]}>
          {isUploading ? (
            <View style={[styles.imagePlaceholder, { width: imageSize, height: imageSize, borderRadius: imageSize / 2 }]}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={[styles.profileImage, { width: imageSize, height: imageSize, borderRadius: imageSize / 2 }]}
            />
          ) : (
            <View style={[styles.imagePlaceholder, { width: imageSize, height: imageSize, borderRadius: imageSize / 2 }]}>
              <User
                size={iconSize}
                color={colors.textSecondary}
                strokeWidth={1.5}
              />
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  imageGradientRing: {
    padding: 4,
  },
  imageInnerRing: {
    backgroundColor: colors.primaryBg,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    backgroundColor: colors.secondaryBg,
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    
  },
});
