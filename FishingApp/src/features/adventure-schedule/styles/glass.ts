import { ViewStyle } from "react-native";

type GlassOptions = {
  highlight?: boolean;
  borderRadius?: number;
  withShadow?: boolean;
  shadowColor?: string;
};

export function glassStyle({
  highlight = false,
  borderRadius = 24,
  withShadow = false,
  shadowColor,
}: GlassOptions = {}): ViewStyle {
  const style: ViewStyle = {
    backgroundColor: highlight
      ? "rgba(18, 219, 192, 0.15)"
      : "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: highlight
      ? "rgba(18, 219, 192, 0.3)"
      : "rgba(255, 255, 255, 0.18)",
    borderRadius,
  };

  if (withShadow) {
    style.shadowColor = shadowColor ?? (highlight ? "#12dbc0" : "#000");
    style.shadowOffset = { width: 0, height: 4 };
    style.shadowOpacity = highlight ? 0.1 : 0.1;
    style.shadowRadius = 12;
    style.elevation = 4;
  }

  return style;
}
