import React, { useMemo, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { colors } from "../../../theme/colors";
import { Timer } from "lucide-react-native";
import FishingCalendar from "../components/FishingCalendar";
import { glassStyle } from "../styles/glass";
import { formatFriendlyDate, getQuickDateStatus } from "../utils/helpers";

interface Step2CalendarSelectionProps {
  initialDate?: string;
  onDateSelected: (date: string) => void;
}

export default function Step2CalendarSelection({
  initialDate,
  onDateSelected,
}: Step2CalendarSelectionProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate || "");
  const quickStatus = useMemo(
    () => (selectedDate ? getQuickDateStatus(selectedDate) : null),
    [selectedDate]
  );
  const friendlyDate = useMemo(
    () => (selectedDate ? formatFriendlyDate(selectedDate) : ""),
    [selectedDate]
  );

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    onDateSelected(date);
  };

  return (
    <View style={styles.container}>
      {/* Selected Date Display */}
      {selectedDate && (
        <View
          style={[
            styles.selectedDateContainer,
            glassStyle({ highlight: true }),
          ]}
        >
          <Timer size={20} color={colors.accent} />
          <View style={styles.selectedDateTextContainer}>
            <Text style={styles.selectedDateLabel}>Selected Date:</Text>
            <Text
              style={[
                styles.selectedDateText,
                quickStatus && { color: quickStatus.color },
              ]}
            >
              {friendlyDate}
            </Text>
          </View>
        </View>
      )}

      {/* Fishing Calendar */}
      <FishingCalendar
        selectedDate={selectedDate}
        onDateSelected={handleDateSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBg,
    padding: 16,
  },
  selectedDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
    gap: 12,
  },
  selectedDateTextContainer: {
    flex: 1,
  },
  selectedDateLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 2,
  },
  selectedDateText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: "600",
  },
});
