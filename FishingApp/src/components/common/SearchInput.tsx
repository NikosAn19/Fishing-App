import React from "react";
import { View, TextInput, StyleSheet, ViewStyle, TextInputProps } from "react-native";
import { BlurView } from "expo-blur";
import { Search } from "lucide-react-native";
import { colors } from "../../theme/colors";

interface SearchInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
}

export const SearchInput = ({ containerStyle, ...props }: SearchInputProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <BlurView intensity={20} tint="dark" style={styles.blur}>
        <Search size={18} color={colors.palette.slate[400]} style={styles.icon} />
        <TextInput
          placeholder="Αναζήτηση περιοχής..."
          placeholderTextColor={colors.palette.slate[500]}
          style={styles.input}
          selectionColor={colors.palette.emerald[500]}
          {...props}
        />
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.palette.slate[700],
    backgroundColor: "rgba(15, 23, 42, 0.9)", // slate-900/90
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  blur: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    height: "100%",
  },
});
