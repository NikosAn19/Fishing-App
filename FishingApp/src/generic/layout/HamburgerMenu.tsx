import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "../../theme/colors";

type MenuItem = {
  title: string;
  icon: string; // Ionicons name
  route: string; // expo-router path
};

const ITEMS: MenuItem[] = [
  { title: "Οδηγός Ειδών", icon: "book-outline", route: "/guide/species" },
  {
    title: "Κανονισμοί & Έλεγχος Μεγέθους",
    icon: "shield-checkmark-outline",
    route: "/guide/regulations",
  },
  { title: "Εξοπλισμός", icon: "list-outline", route: "/gear" },
  { title: "Στατιστικά", icon: "stats-chart-outline", route: "/insights" },
  { title: "Κοινότητα", icon: "people-outline", route: "/community" },
  { title: "Βοήθεια", icon: "help-circle-outline", route: "/help" },
  { title: "Σχετικά", icon: "information-circle-outline", route: "/about" },
];

interface HamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function HamburgerMenu({
  visible,
  onClose,
}: HamburgerMenuProps) {
  const router = useRouter();

  const handleItemPress = (route: string) => {
    onClose();
    // Navigate to the route
    router.push(route as any);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.menuContainer}>
          {/* Header / Brand */}
          <View style={styles.header}>
            <Text style={styles.brand}>
              <Text style={{ color: colors.accent }}>Psaraki</Text>
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {ITEMS.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={styles.row}
                onPress={() => handleItemPress(item.route)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={colors.white}
                  style={styles.icon}
                />
                <Text style={styles.title}>{item.title}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="rgba(255,255,255,0.5)"
                  style={styles.chevron}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdrop: {
    flex: 1,
  },
  menuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "80%",
    height: "100%",
    backgroundColor: colors.primaryBg,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  brand: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.white,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  icon: {
    width: 28,
    marginRight: 8,
  },
  title: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
  chevron: {
    marginLeft: 8,
  },
});


