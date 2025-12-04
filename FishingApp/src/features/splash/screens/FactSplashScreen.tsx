import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, ImageBackground, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colorPalette } from '../../../theme/colors';
import { getRandomFact, FishFact } from '../data/fishFacts';

const { width, height } = Dimensions.get('window');

interface FactSplashScreenProps {
  onFinish?: () => void;
}

export default function FactSplashScreen({ onFinish }: FactSplashScreenProps) {
  const [fact, setFact] = useState<FishFact | null>(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Pick a random fact
    setFact(getRandomFact());

    // 2. Start Entrance Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      // Progress Bar Animation (Simulates loading time)
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3500, // Show for 3.5 seconds
        useNativeDriver: false, // width doesn't support native driver
      })
    ]).start(() => {
        // Optional: Trigger finish callback if provided
        if (onFinish) onFinish();
    });

  }, []);

  if (!fact) return null;

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[colorPalette.slate[950], colorPalette.slate[900], colorPalette.slate[800]]}
        style={styles.background}
      />

      {/* Content Container */}
      <View style={styles.content}>
        
        {/* App Logo (Small & Subtle) */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
             <Text style={styles.appTitle}>FISHING APP</Text>
        </Animated.View>

        {/* Fact Card */}
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {fact.image ? (
            <View style={styles.imageContainer}>
              <Image source={fact.image} style={styles.factImage} resizeMode="cover" />
            </View>
          ) : (
            <View style={styles.iconContainer}>
              <Ionicons name={fact.icon as any || 'fish'} size={32} color={colorPalette.emerald[400]} />
            </View>
          )}
          
          <Text style={styles.didYouKnow}>ΤΟ ΗΞΕΡΕΣ;</Text>
          
          <Text style={styles.factText}>
            "{fact.fact}"
          </Text>
          
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{fact.category.toUpperCase()}</Text>
          </View>
        </Animated.View>

        {/* Loading Indicator */}
        <View style={styles.loaderContainer}>
            <View style={styles.progressBarBg}>
                <Animated.View 
                    style={[
                        styles.progressBarFill, 
                        { 
                            width: progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%']
                            }) 
                        }
                    ]} 
                />
            </View>
            <Text style={styles.loadingText}>Ετοιμασία εξοπλισμού...</Text>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPalette.slate[950],
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  appTitle: {
      color: colorPalette.slate[400],
      fontSize: 12,
      letterSpacing: 4,
      fontWeight: 'bold',
      marginBottom: 40,
      opacity: 0.7
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)', // Glassmorphism
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
      marginBottom: 24,
      backgroundColor: 'rgba(52, 211, 153, 0.1)',
      padding: 16,
      borderRadius: 50,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  factImage: {
    width: '100%',
    height: '100%',
  },
  didYouKnow: {
    color: colorPalette.emerald[400],
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 16,
  },
  factText: {
    color: colorPalette.slate[200],
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
    fontFamily: 'System', // Use system font for now, or custom if available
  },
  categoryTag: {
      backgroundColor: colorPalette.slate[800],
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
  },
  categoryText: {
      color: colorPalette.slate[400],
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
  },
  loaderContainer: {
      position: 'absolute',
      bottom: 60,
      width: '100%',
      alignItems: 'center',
  },
  progressBarBg: {
      width: 120,
      height: 4,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 2,
      marginBottom: 12,
      overflow: 'hidden',
  },
  progressBarFill: {
      height: '100%',
      backgroundColor: colorPalette.emerald[500],
      borderRadius: 2,
  },
  loadingText: {
      color: colorPalette.slate[500],
      fontSize: 12,
  }
});
