import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Circle as SvgCircle } from "react-native-svg";
import { colors } from "../../../theme/colors"; // ← adjust path
import { pct } from "../types";

type Props = { score: number; size?: number; strokeW?: number };

export default function DonutGauge({ score, size = 190, strokeW = 16 }: Props) {
  const r = (size - strokeW) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const progress = circ * (Math.max(0, Math.min(100, score)) / 100);

  return (
    <View style={[styles.gaugeWrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.accent} />
            <Stop offset="1" stopColor="#A7F3D0" />
          </LinearGradient>
        </Defs>
        <SvgCircle
          cx={cx}
          cy={cy}
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeW}
          fill="transparent"
        />
        <SvgCircle
          cx={cx}
          cy={cy}
          r={r}
          stroke="url(#gaugeGrad)"
          strokeWidth={strokeW}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={`${progress}, ${circ}`}
          rotation={-90}
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.scoreText}>{pct(score)}</Text>
        <Text style={styles.scoreUnit}>/100</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gaugeWrap: { alignItems: "center", justifyContent: "center" },
  center: { position: "absolute", alignItems: "flex-end", flexDirection: "row" },
  scoreText: { color: colors.white, fontSize: 40, fontWeight: "900", lineHeight: 42 },
  scoreUnit: { color: "#9BA3AF", marginLeft: 4, fontWeight: "600" },
});
