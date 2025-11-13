import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { colors } from "../../theme/colors";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react-native";
import { glassStyle } from "../styles/glass";
import {
  addMonths,
  buildMonthMatrix,
  formatDateForApi,
  formatMonthYear,
  isSelectableDate,
  isSameDay,
  isSameDayISO,
  isTodayDate,
  normalizeDate,
  startOfMonth,
} from "../utils/helpers";

interface FishingCalendarProps {
  selectedDate?: string;
  onDateSelected: (date: string) => void;
}

const { width } = Dimensions.get("window");
// Calculate exact cell width to ensure 7 cells per row with perfect alignment
// Available width inside container: window width - margin (8*2) - padding (16*2) = width - 48
// Border is included in container's space, so we don't subtract it separately
const CONTAINER_PADDING = 16; // Left + right padding
const CONTAINER_MARGIN = 8; // Left + right margin
const AVAILABLE_WIDTH = width - CONTAINER_MARGIN * 2 - CONTAINER_PADDING * 2;
const CELL_WIDTH = AVAILABLE_WIDTH / 7; // Use exact division for perfect alignment
const CELL_HEIGHT = 48;

// Helper function to format date as YYYY-MM-DD in local timezone (avoid UTC conversion)
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function FishingCalendar({
  selectedDate,
  onDateSelected,
}: FishingCalendarProps) {
  const today = useMemo(() => normalizeDate(new Date()), []);
  const minMonth = useMemo(() => startOfMonth(today), [today]);
  const maxDate = useMemo(() => addMonths(today, 3), [today]);
  const [currentMonth, setCurrentMonth] = useState(minMonth);

  const days = useMemo(() => buildMonthMatrix(currentMonth), [currentMonth]);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const isAtCurrentMonth = useMemo(
    () => isSameDay(currentMonth, minMonth),
    [currentMonth, minMonth]
  );

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => addMonths(prev, direction === "prev" ? -1 : 1));
  };

  return (
    <View style={[styles.container, glassStyle({ borderRadius: 16 })]}>
      {/* Calendar Header */}
      <View style={styles.calendarHeader}>
        <View style={styles.monthNavigation}>
          <TouchableOpacity
            onPress={() => navigateMonth("prev")}
            style={styles.navButton}
            disabled={isAtCurrentMonth}
          >
            <ChevronLeft
              size={20}
              color={isAtCurrentMonth ? "rgba(255,255,255,0.3)" : colors.white}
            />
          </TouchableOpacity>

          <View style={styles.monthYearContainer}>
            <Calendar size={20} color={colors.accent} />
            <Text style={styles.monthYearText}>
              {formatMonthYear(currentMonth)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigateMonth("next")}
            style={styles.navButton}
          >
            <ChevronRight size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Day Names Header */}
      <View style={styles.dayNamesRow}>
        {dayNames.map((dayName) => (
          <View key={dayName} style={styles.dayNameCell}>
            <Text style={styles.dayNameText}>{dayName}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {days.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={styles.emptyDayCell} />;
          }

          const selectable = isSelectableDate(date, {
            min: today,
            max: maxDate,
          });
          const selected = !!selectedDate && isSameDayISO(date, selectedDate);
          const todayFlag = isTodayDate(date);

          return (
            <TouchableOpacity
              key={`day-${date.getTime()}`}
              onPress={() =>
                selectable && onDateSelected(formatDateForApi(date))
              }
              style={styles.dayCell}
              disabled={!selectable}
            >
              <View
                style={[
                  styles.dayCellInner,
                  selected && styles.dayCellInnerSelected,
                  todayFlag && !selected && styles.dayCellInnerToday,
                  !selectable && styles.dayCellInnerDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    selected && styles.dayTextSelected,
                    todayFlag && !selected && styles.dayTextToday,
                    !selectable && styles.dayTextDisabled,
                  ]}
                >
                  {date.getDate()}
                </Text>
                {todayFlag && !selected && (
                  <View style={styles.todayIndicator} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 8,
    padding: 16,
    borderRadius: 16,
    overflow: "hidden", // Prevent any child overflow
  },
  calendarHeader: {
    marginBottom: 16,
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  monthYearContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.white,
  },
  dayNamesRow: {
    flexDirection: "row",
    marginBottom: 12,
    width: CELL_WIDTH * 7, // Match calendar grid width exactly
    alignSelf: "center", // Center the row for equal left/right spacing
  },
  dayNameCell: {
    width: CELL_WIDTH,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: CELL_WIDTH * 7, // Ensure exactly 7 cells fit per row
    alignSelf: "center", // Center the grid for equal left/right spacing
  },
  emptyDayCell: {
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
  },
  dayCell: {
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: 2, // Small padding to contain the inner styled area
  },
  dayCellInner: {
    width: "90%",
    height: "90%",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  dayCellInnerSelected: {
    backgroundColor: colors.accent,
  },
  dayCellInnerToday: {
    backgroundColor: "rgba(18, 219, 192, 0.2)",
    borderWidth: 1,
    borderColor: colors.accent,
  },
  dayCellInnerDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  dayTextSelected: {
    color: colors.primaryBg,
  },
  dayTextToday: {
    color: colors.accent,
  },
  dayTextDisabled: {
    color: "rgba(255,255,255,0.3)",
  },
  todayIndicator: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
});
