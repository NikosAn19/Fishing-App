import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Line,
  Circle,
} from "react-native-svg";
import { Waves } from "lucide-react-native";
import { colors } from "../../../../theme/colors";
import { WeatherDashboardTideChartProps } from "./types";

type TideState = "low" | "rising" | "high" | "falling";

const TIDE_STATES: TideState[] = ["low", "rising", "high", "falling"];

const TIDE_LABELS: Record<TideState, string> = {
  low: "Χαμηλή",
  rising: "Ανεβαίνει",
  high: "Υψηλή",
  falling: "Κατεβαίνει",
};

// Marker positions along the static curve based on tide state
const TIDE_MARKER_POSITIONS: Record<TideState, { x: number; y: number }> = {
  low: { x: 20, y: 78 }, // Left side, low position
  rising: { x: 75, y: 50 }, // Rising position
  high: { x: 150, y: 20 }, // Top, high position
  falling: { x: 225, y: 50 }, // Right side, falling position
};

const TIDE_HEIGHTS: Record<TideState, string> = {
  low: "0.4m",
  rising: "0.9m",
  high: "1.5m",
  falling: "0.8m",
};

// STATIC wave curve - never changes, only the marker moves along it
const STATIC_WAVE_FILLED = "M0,80 C60,80 90,20 150,20 S240,80 300,80 V100 H0 Z";
const STATIC_WAVE_STROKE = "M0,80 C60,80 90,20 150,20 S240,80 300,80";

export default function WeatherDashboardTideChart({
  title,
  nextHighTide,
  nextLowTide,
  height = 180,
}: WeatherDashboardTideChartProps) {
  const [tideState, setTideState] = useState<TideState>("rising");
  const [markerX, setMarkerX] = useState(TIDE_MARKER_POSITIONS[tideState].x);
  const [markerY, setMarkerY] = useState(TIDE_MARKER_POSITIONS[tideState].y);
  const [pulseOpacity, setPulseOpacity] = useState(0.3);

  // Animated values for marker position using React Native's built-in Animated API
  const markerXAnim = useRef(
    new Animated.Value(TIDE_MARKER_POSITIONS[tideState].x)
  ).current;
  const markerYAnim = useRef(
    new Animated.Value(TIDE_MARKER_POSITIONS[tideState].y)
  ).current;
  const pulseOpacityAnim = useRef(new Animated.Value(0.3)).current;

  // Update marker position when tide state changes
  useEffect(() => {
    const position = TIDE_MARKER_POSITIONS[tideState];

    // Animate marker position smoothly
    Animated.parallel([
      Animated.timing(markerXAnim, {
        toValue: position.x,
        duration: 700,
        useNativeDriver: false, // SVG animations can't use native driver
      }),
      Animated.timing(markerYAnim, {
        toValue: position.y,
        duration: 700,
        useNativeDriver: false,
      }),
    ]).start();

    // Listen to animated values and update state for SVG rendering
    const xListener = markerXAnim.addListener(({ value }) => {
      setMarkerX(value);
    });
    const yListener = markerYAnim.addListener(({ value }) => {
      setMarkerY(value);
    });

    return () => {
      markerXAnim.removeListener(xListener);
      markerYAnim.removeListener(yListener);
    };
  }, [tideState, markerXAnim, markerYAnim]);

  // Pulse animation for the outer circle (continuous)
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacityAnim, {
          toValue: 0.1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(pulseOpacityAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    pulseAnimation.start();

    // Listen to opacity changes
    const opacityListener = pulseOpacityAnim.addListener(({ value }) => {
      setPulseOpacity(value);
    });

    return () => {
      pulseAnimation.stop();
      pulseOpacityAnim.removeListener(opacityListener);
    };
  }, [pulseOpacityAnim]);

  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Waves size={14} color={colors.palette.blue[400]} />
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* State Buttons */}
        <View style={styles.stateButtons}>
          {TIDE_STATES.map((state) => (
            <TouchableOpacity
              key={state}
              style={[
                styles.stateButton,
                tideState === state && styles.stateButtonActive,
              ]}
              onPress={() => setTideState(state)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.stateButtonText,
                  tideState === state && styles.stateButtonTextActive,
                ]}
              >
                {TIDE_LABELS[state]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chart Card */}
      <View style={[styles.chart, { height }]}>
        {/* Info Bar */}
        <View style={styles.infoBar}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>ΕΠΟΜΕΝΗ ΠΛΗΜΜΥΡΙΔΑ:</Text>
            <Text style={styles.infoValue}>{nextHighTide || "—"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>ΕΠΟΜΕΝΗ ΑΜΠΩΤΗ:</Text>
            <Text style={styles.infoValue}>{nextLowTide || "—"}</Text>
          </View>
        </View>

        {/* SVG Visualization */}
        <View style={styles.chartSvg}>
          <Svg
            height="100%"
            width="100%"
            viewBox="0 0 300 100"
            preserveAspectRatio="none"
          >
            <Defs>
              <SvgGradient id="tideGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop
                  offset="0%"
                  stopColor={colors.palette.blue[500]}
                  stopOpacity="0.4"
                />
                <Stop
                  offset="100%"
                  stopColor={colors.palette.blue[500]}
                  stopOpacity="0"
                />
              </SvgGradient>
            </Defs>

            {/* STATIC filled path - never changes */}
            <Path d={STATIC_WAVE_FILLED} fill="url(#tideGradient)" />
            {/* STATIC stroke path - never changes */}
            <Path
              d={STATIC_WAVE_STROKE}
              fill="none"
              stroke={colors.palette.blue[500]}
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Animated marker line - moves along the static curve */}
            <Line
              x1={markerX}
              y1="0"
              x2={markerX}
              y2="100"
              stroke={colors.palette.slate[300]}
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.3"
            />
            {/* Animated marker circles - move along the static curve */}
            <Circle
              cx={markerX}
              cy={markerY}
              r="8"
              fill={colors.palette.emerald[400]}
              opacity={pulseOpacity}
            />
            <Circle
              cx={markerX}
              cy={markerY}
              r="4"
              fill="white"
              stroke={colors.palette.emerald[400]}
              strokeWidth="2"
            />
          </Svg>

          {/* "Now" Indicator - Centered Overlay */}
          <View style={styles.nowIndicator}>
            <View style={styles.nowIndicatorContent}>
              <Text style={styles.nowLabel}>ΤΩΡΑ</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.nowValue}>{TIDE_LABELS[tideState]}</Text>
                <Text style={styles.nowTime}> {TIDE_HEIGHTS[tideState]}</Text>
              </View>
            </View>
          </View>

          {/* Axis Labels */}
          <Text style={styles.labelBottom}>0m</Text>
          <Text style={styles.labelTop}>1.5m</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.palette.slate[200],
    marginLeft: 8,
  },
  stateButtons: {
    flexDirection: "row",
    backgroundColor: colors.palette.slate[900],
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.palette.slate[800],
    gap: 2,
  },
  stateButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stateButtonActive: {
    backgroundColor: colors.palette.blue[500],
  },
  stateButtonText: {
    fontSize: 8,
    fontWeight: "bold",
    color: colors.palette.slate[500],
    textTransform: "uppercase",
  },
  stateButtonTextActive: {
    color: colors.white,
  },
  chart: {
    width: "100%",
    backgroundColor: colors.palette.slate[900] + "66",
    borderWidth: 1,
    borderColor: colors.palette.slate[800],
    borderRadius: 24,
    position: "relative",
    overflow: "hidden",
  },
  infoBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.white + "0D",
    backgroundColor: colors.palette.slate[950] + "33",
  },
  infoItem: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  infoLabel: {
    fontSize: 8,
    color: colors.palette.slate[400],
    textTransform: "uppercase",
    fontFamily: "monospace",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    color: colors.white,
    fontWeight: "bold",
  },
  chartSvg: {
    height: 160, // Increased height to ensure animations are always visible
    width: "100%",
    position: "relative",
  },
  nowIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
    pointerEvents: "none",
  },
  nowIndicatorContent: {
    backgroundColor: colors.palette.slate[900] + "E6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.palette.slate[700],
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  nowLabel: {
    fontSize: 7,
    color: colors.palette.slate[400],
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  nowValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.palette.emerald[400],
    textTransform: "uppercase",
  },
  nowTime: {
    fontSize: 9,
    color: colors.white,
    marginLeft: 4,
    fontWeight: "normal",
  },
  labelBottom: {
    position: "absolute",
    bottom: 8,
    left: 12,
    fontSize: 8,
    color: colors.palette.slate[500],
  },
  labelTop: {
    position: "absolute",
    top: 20,
    left: 12,
    fontSize: 8,
    color: colors.palette.slate[500],
  },
});
